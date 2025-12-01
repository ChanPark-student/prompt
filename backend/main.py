from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from datetime import datetime, timedelta
from typing import List, Optional

from backend import database as models, schemas
from backend.database import get_db, create_db_and_tables, School, Subject
from backend.auth import get_password_hash, verify_password, create_access_token, verify_access_token, get_current_user_or_none
from backend.schemas import School as SchemaSchool # Import School from schemas with an alias

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency to get current user from token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    username = verify_access_token(token, credentials_exception)
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def create_school_if_not_exists(db: Session, school_name: str):
    school = db.query(School).filter(School.name == school_name).first()
    if not school:
        new_school = School(name=school_name)
        db.add(new_school)
        db.commit()
        db.refresh(new_school)
        print(f"--- School '{school_name}' added to database. ---")
    else:
        print(f"--- School '{school_name}' already exists in database. ---")

def create_subject_if_not_exists(db: Session, subject_name: str):
    subject = db.query(Subject).filter(Subject.name == subject_name).first()
    if not subject:
        new_subject = Subject(name=subject_name)
        db.add(new_subject)
        db.commit()
        db.refresh(new_subject)
        print(f"--- Subject '{subject_name}' added to database. ---")
    else:
        print(f"--- Subject '{subject_name}' already exists in database. ---")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    print("Database tables created!")
    db = next(get_db()) # Get a database session
    create_school_if_not_exists(db, "전남대학교")
    create_subject_if_not_exists(db, "산업공학입문")
    create_subject_if_not_exists(db, "경제성공학")
    create_subject_if_not_exists(db, "확률통계")
    db.close() # Close the session

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/schools/", response_model=List[schemas.School])
def read_schools(db: Session = Depends(get_db)):
    schools = db.query(models.School).all()
    return schools


@app.get("/subjects/", response_model=List[schemas.Subject])
def read_subjects(db: Session = Depends(get_db)):
    subjects = db.query(models.Subject).all()
    return subjects


@app.get("/stats/prompts/count", response_model=int)
def get_prompts_count(db: Session = Depends(get_db)):
    return db.query(models.Prompt).count()

@app.get("/stats/prompts/total-likes", response_model=int)
def get_total_likes(db: Session = Depends(get_db)):
    total_likes = db.query(func.sum(models.Prompt.likes)).scalar()
    return total_likes if total_likes is not None else 0

@app.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(or_(models.User.username == user.username, models.User.email == user.email)).first()
    if db_user:
        if db_user.username == user.username:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        name=user.name,
        gender=user.gender,
        age=user.age,
        school=user.school,
        studentId=user.studentId,
        created_at=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    print(f"--- User '{new_user.username}' with full profile committed to database. ---")
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        or_(models.User.username == login_data.username, models.User.email == login_data.username)
    ).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.get("/users/me/prompts", response_model=List[schemas.Prompt])
def read_user_prompts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user_prompts = db.query(models.Prompt).filter(models.Prompt.owner_id == current_user.id).all()
    return user_prompts

@app.post("/prompts/", response_model=schemas.Prompt)
def create_prompt(
    prompt: schemas.PromptCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_prompt = models.Prompt(**prompt.dict(), owner_id=current_user.id)
    db.add(db_prompt)
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

# Temporary map to resolve subject_id to name, mirroring lib/subjects.ts
subjects_map = {
    "1": "산업공학입문",
    "2": "경제성공학",
    "3": "확률통계",
}

@app.get("/prompts/", response_model=List[schemas.Prompt])
def read_prompts(
    skip: int = 0,
    limit: int = 100,
    subject_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_or_none)
):
    query = db.query(models.Prompt)

    if subject_id and subject_id in subjects_map:
        subject_name = subjects_map[subject_id]
        query = query.filter(models.Prompt.subject == subject_name)
    
    prompts = query.offset(skip).limit(limit).all()

    # Manually populate current_user_feedback for each prompt
    response_prompts = []
    for db_prompt in prompts:
        response_prompt = schemas.Prompt.from_orm(db_prompt)
        if current_user:
            user_feedback = db.query(models.PromptFeedback).filter(
                models.PromptFeedback.user_id == current_user.id,
                models.PromptFeedback.prompt_id == db_prompt.id
            ).first()
            response_prompt.current_user_feedback = user_feedback.feedback_type if user_feedback else None
        response_prompts.append(response_prompt)
        
    return response_prompts

@app.get("/prompts/{prompt_id}", response_model=schemas.Prompt)
def read_prompt(
    prompt_id: int, 
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_or_none)
):
    db_prompt = db.query(models.Prompt).filter(models.Prompt.id == prompt_id).first()
    if db_prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")

    # Check for current user's feedback
    user_feedback = None
    if current_user: # Only query if current_user is authenticated
        user_feedback = db.query(models.PromptFeedback).filter(
            models.PromptFeedback.user_id == current_user.id,
            models.PromptFeedback.prompt_id == prompt_id
        ).first()
    
    # Create a schemas.Prompt instance and then set the current_user_feedback
    response_prompt = schemas.Prompt.from_orm(db_prompt)
    response_prompt.current_user_feedback = user_feedback.feedback_type if user_feedback else None
    
    return response_prompt
@app.post("/prompts/{prompt_id}/feedback", response_model=schemas.Prompt)
def give_prompt_feedback(
    prompt_id: int,
    feedback_data: schemas.PromptFeedbackBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_prompt = db.query(models.Prompt).filter(models.Prompt.id == prompt_id).first()
    if db_prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")

    existing_feedback = db.query(models.PromptFeedback).filter(
        models.PromptFeedback.user_id == current_user.id,
        models.PromptFeedback.prompt_id == prompt_id
    ).first()

    feedback_type = feedback_data.feedback_type

    if feedback_type not in ["like", "dislike"]:
        raise HTTPException(status_code=400, detail="Invalid feedback type")

    if existing_feedback:
        if existing_feedback.feedback_type == feedback_type:
            # User is toggling off their existing feedback (e.g., liked, clicks like again)
            if feedback_type == "like":
                db_prompt.likes -= 1
            else:
                db_prompt.dislikes -= 1
            db.delete(existing_feedback)
        else:
            # User is changing feedback (e.g., liked, then dislikes)
            if feedback_type == "like":
                db_prompt.likes += 1
                db_prompt.dislikes -= 1
            else: # feedback_type == "dislike"
                db_prompt.dislikes += 1
                db_prompt.likes -= 1
            existing_feedback.feedback_type = feedback_type
    else:
        # No existing feedback, create new
        if feedback_type == "like":
            db_prompt.likes += 1
        else:
            db_prompt.dislikes += 1
        
        new_feedback = models.PromptFeedback(
            user_id=current_user.id,
            prompt_id=prompt_id,
            feedback_type=feedback_type
        )
        db.add(new_feedback)

    db.commit()
    db.refresh(db_prompt)
    return db_prompt


@app.post("/users/bootstrap-admin", response_model=schemas.UserResponse, include_in_schema=False)
def bootstrap_admin(
    user_action: schemas.UserAction,
    db: Session = Depends(get_db),
):
    # Check if any admin user already exists
    if db.query(models.User).filter(models.User.is_admin == True).first():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="An admin user already exists. This endpoint is for initial setup only.",
        )

    user_to_bootstrap = db.query(models.User).filter(models.User.username == user_action.username).first()
    if not user_to_bootstrap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User to bootstrap not found")

    user_to_bootstrap.is_admin = True
    db.commit()
    db.refresh(user_to_bootstrap)
    return user_to_bootstrap

@app.delete("/prompts/{prompt_id}", status_code=status.HTTP_200_OK)
def increment_prompt_view(
    prompt_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_prompt = db.query(models.Prompt).filter(models.Prompt.id == prompt_id).first()
    if db_prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # Increment view count and commit
    db_prompt.views += 1
    db.commit()
    db.refresh(db_prompt)
    
    return db_prompt