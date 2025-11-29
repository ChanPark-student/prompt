from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Pydantic schema for Prompt
class PromptBase(BaseModel):
    title: str
    content: str
    subject: str

class PromptCreate(PromptBase):
    pass

class Prompt(PromptBase):
    id: int
    owner_id: int
    created_at: datetime
    author: str
    views: int
    likes: int
    dislikes: int
    current_user_feedback: Optional[str] = None # 'like', 'dislike', or None

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: EmailStr

# UserCreate now includes all fields for signup from the frontend
class UserCreate(UserBase):
    password: str
    name: str
    gender: str
    age: str
    school: str
    studentId: str

class UserLogin(BaseModel):
    username: str
    password: str

# Schema for the user data returned to the client
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    name: Optional[str]
    gender: Optional[str]
    age: Optional[str]
    school: Optional[str]
    studentId: Optional[str]

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class PromptFeedbackBase(BaseModel):
    feedback_type: str

class PromptFeedbackCreate(PromptFeedbackBase):
    prompt_id: int

class PromptFeedback(PromptFeedbackBase):
    id: int
    user_id: int
    prompt_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Pydantic schema for School
class SchoolBase(BaseModel):
    name: str

class School(SchoolBase):
    id: int

    class Config:
        from_attributes = True


# Pydantic schema for Subject
class SubjectBase(BaseModel):
    name: str

class Subject(SubjectBase):
    id: int

    class Config:
        from_attributes = True
