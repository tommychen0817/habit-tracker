from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import date

import models
import schemas
from database import engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Habit Tracker API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],  # Added docker service name
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Habit endpoints
@app.get("/habits", response_model=List[schemas.Habit])
def get_habits(db: Session = Depends(get_db)):
    return db.query(models.Habit).all()

@app.post("/habits", response_model=schemas.Habit)
def create_habit(habit: schemas.HabitCreate, db: Session = Depends(get_db)):
    db_habit = models.Habit(**habit.dict())
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

@app.get("/habits/{habit_id}", response_model=schemas.Habit)
def get_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit

@app.put("/habits/{habit_id}", response_model=schemas.Habit)
def update_habit(habit_id: int, habit_update: schemas.HabitUpdate, db: Session = Depends(get_db)):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    for field, value in habit_update.dict(exclude_unset=True).items():
        setattr(habit, field, value)
    
    db.commit()
    db.refresh(habit)
    return habit

@app.delete("/habits/{habit_id}")
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
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
    db: Session = Depends(get_db)
):
    # Check if habit exists
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Check if completion already exists for this date
    existing = db.query(models.HabitCompletion).filter(
        models.HabitCompletion.habit_id == habit_id,
        models.HabitCompletion.date == completion.date
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Completion already exists for this date")
    
    db_completion = models.HabitCompletion(habit_id=habit_id, **completion.dict())
    db.add(db_completion)
    db.commit()
    db.refresh(db_completion)
    return db_completion

@app.put("/habits/{habit_id}/completions/{completion_date}", response_model=schemas.HabitCompletion)
def update_completion(
    habit_id: int,
    completion_date: date,
    completion_update: schemas.HabitCompletionUpdate,
    db: Session = Depends(get_db)
):
    completion = db.query(models.HabitCompletion).filter(
        models.HabitCompletion.habit_id == habit_id,
        models.HabitCompletion.date == completion_date
    ).first()
    
    if not completion:
        raise HTTPException(status_code=404, detail="Completion not found")
    
    for field, value in completion_update.dict(exclude_unset=True).items():
        setattr(completion, field, value)
    
    db.commit()
    db.refresh(completion)
    return completion

@app.delete("/habits/{habit_id}/completions/{completion_date}")
def delete_completion(habit_id: int, completion_date: date, db: Session = Depends(get_db)):
    completion = db.query(models.HabitCompletion).filter(
        models.HabitCompletion.habit_id == habit_id,
        models.HabitCompletion.date == completion_date
    ).first()
    
    if not completion:
        raise HTTPException(status_code=404, detail="Completion not found")
    
    db.delete(completion)
    db.commit()
    return {"message": "Completion deleted successfully"}

@app.get("/")
def root():
    return {"message": "Habit Tracker API"}
