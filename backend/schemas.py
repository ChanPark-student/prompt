from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

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
