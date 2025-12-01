from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy.schema import UniqueConstraint
from datetime import datetime
import os

# --- Database Configuration ---
# Check for a production DATABASE_URL environment variable (from Render, etc.)
# If it exists, use it. Otherwise, fall back to a local SQLite database.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# For production PostgreSQL on services like Render, the URL might start with "postgres://"
# but SQLAlchemy 1.4+ requires "postgresql://".
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# If no production URL is found, use local SQLite
if not SQLALCHEMY_DATABASE_URL:
    print("--- No DATABASE_URL found, falling back to SQLite ---")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
    # The 'check_same_thread' argument is specific to SQLite
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    print("--- DATABASE_URL found, connecting to production database ---")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class for declarative models
Base = declarative_base()

# Define the Prompt model
from sqlalchemy.ext.hybrid import hybrid_property

class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text, index=True)
    subject = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    dislikes = Column(Integer, default=0)

    owner = relationship("User", back_populates="prompts")
    feedback = relationship("PromptFeedback", back_populates="prompt")

    @hybrid_property
    def author(self):
        return self.owner.name

# Define the PromptFeedback model
class PromptFeedback(Base):
    __tablename__ = "prompt_feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    prompt_id = Column(Integer, ForeignKey("prompts.id"))
    feedback_type = Column(String) # 'like' or 'dislike'
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint('user_id', 'prompt_id', name='_user_prompt_uc'),)

    user = relationship("User", back_populates="feedback")
    prompt = relationship("Prompt", back_populates="feedback")

# Define the User model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)  # Add is_admin field
    created_at = Column(DateTime, default=datetime.utcnow)

    # Extended profile information
    name = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    age = Column(String, nullable=True)
    school = Column(String, nullable=True)
    studentId = Column(String, name="student_id", nullable=True) # Use 'student_id' as column name for convention

    prompts = relationship("Prompt", back_populates="owner")
    feedback = relationship("PromptFeedback", back_populates="user")


# Define the School model
class School(Base):
    __tablename__ = "schools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)


# Define the Subject model
class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)


# Function to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables in the database
def create_db_and_tables():
    Base.metadata.create_all(bind=engine)
