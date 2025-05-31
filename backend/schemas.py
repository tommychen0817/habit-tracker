from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

class HabitCompletionBase(BaseModel):
    date: date
    description: Optional[str] = None

class HabitCompletionCreate(HabitCompletionBase):
    pass

class HabitCompletionUpdate(BaseModel):
    description: Optional[str] = None

class HabitCompletion(HabitCompletionBase):
    id: int
    habit_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class HabitBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: str = "bg-blue-500"

class HabitCreate(HabitBase):
    pass

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None

class Habit(HabitBase):
    id: int
    created_at: datetime
    completions: List[HabitCompletion] = []

    class Config:
        from_attributes = True
