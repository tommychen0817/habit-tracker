import os
from datetime import date
from typing import List

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Habit Tracker API", version="1.0.0")

SECRET_KEY = os.getenv("JWT_SECRET", "changeme")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/google")


class GoogleAuthRequest(BaseModel):
    id_token: str


# Configure CORS for production
origins = [
    "http://localhost:3000",  # Local development
    "https://localhost:3000",
    "https://habit-tracker-eight-phi.vercel.app/",  # Replace with your actual Vercel URL
]

# Add environment variable for additional origins
if cors_origins := os.getenv("CORS_ORIGINS"):
    origins.extend(cors_origins.split(","))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}


# Root endpoint
@app.get("/")
def root():
    return {"message": "Habit Tracker API", "version": "1.0.0"}


def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int | None = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).get(user_id)
    if user is None:
        raise credentials_exception
    return user


@app.post("/auth/google", response_model=schemas.Token)
def auth_google(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(data.id_token, google_requests.Request())
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID token")

    email = idinfo.get("email")
    name = idinfo.get("name")
    if not email:
        raise HTTPException(status_code=400, detail="Email not found in token")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(email=email, name=name)
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token({"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


# Habit endpoints
@app.get("/habits", response_model=List[schemas.Habit])
def get_habits(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Habit).filter(models.Habit.user_id == current_user.id).all()


@app.post("/habits", response_model=schemas.Habit)
def create_habit(
    habit: schemas.HabitCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_habit = models.Habit(user_id=current_user.id, **habit.dict())
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit


@app.get("/habits/{habit_id}", response_model=schemas.Habit)
def get_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    habit = (
        db.query(models.Habit)
        .filter(models.Habit.id == habit_id, models.Habit.user_id == current_user.id)
        .first()
    )
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit


@app.put("/habits/{habit_id}", response_model=schemas.Habit)
def update_habit(
    habit_id: int,
    habit_update: schemas.HabitUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    habit = (
        db.query(models.Habit)
        .filter(models.Habit.id == habit_id, models.Habit.user_id == current_user.id)
        .first()
    )
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    for field, value in habit_update.dict(exclude_unset=True).items():
        setattr(habit, field, value)

    db.commit()
    db.refresh(habit)
    return habit


@app.delete("/habits/{habit_id}")
def delete_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    habit = (
        db.query(models.Habit)
        .filter(models.Habit.id == habit_id, models.Habit.user_id == current_user.id)
        .first()
    )
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    db.delete(habit)
    db.commit()
    return {"message": "Habit deleted successfully"}


# Habit completion endpoints
@app.post("/habits/{habit_id}/completions", response_model=schemas.HabitCompletion)
def create_completion(
    habit_id: int,
    completion: schemas.HabitCompletionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Check if habit exists and belongs to user
    habit = (
        db.query(models.Habit)
        .filter(models.Habit.id == habit_id, models.Habit.user_id == current_user.id)
        .first()
    )
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    # Check if completion already exists for this date
    existing = (
        db.query(models.HabitCompletion)
        .filter(
            models.HabitCompletion.habit_id == habit_id,
            models.HabitCompletion.date == completion.date,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400, detail="Completion already exists for this date"
        )

    db_completion = models.HabitCompletion(habit_id=habit_id, **completion.dict())
    db.add(db_completion)
    db.commit()
    db.refresh(db_completion)
    return db_completion


@app.put(
    "/habits/{habit_id}/completions/{completion_date}",
    response_model=schemas.HabitCompletion,
)
def update_completion(
    habit_id: int,
    completion_date: date,
    completion_update: schemas.HabitCompletionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    completion = (
        db.query(models.HabitCompletion)
        .join(models.Habit)
        .filter(
            models.HabitCompletion.habit_id == habit_id,
            models.HabitCompletion.date == completion_date,
            models.Habit.user_id == current_user.id,
        )
        .first()
    )

    if not completion:
        raise HTTPException(status_code=404, detail="Completion not found")

    for field, value in completion_update.dict(exclude_unset=True).items():
        setattr(completion, field, value)

    db.commit()
    db.refresh(completion)
    return completion


@app.delete("/habits/{habit_id}/completions/{completion_date}")
def delete_completion(
    habit_id: int,
    completion_date: date,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    completion = (
        db.query(models.HabitCompletion)
        .join(models.Habit)
        .filter(
            models.HabitCompletion.habit_id == habit_id,
            models.HabitCompletion.date == completion_date,
            models.Habit.user_id == current_user.id,
        )
        .first()
    )

    if not completion:
        raise HTTPException(status_code=404, detail="Completion not found")

    db.delete(completion)
    db.commit()
    return {"message": "Completion deleted successfully"}