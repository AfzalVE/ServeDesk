# app/models/session.py
from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, Boolean
from datetime import datetime
from app.database import Base

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    token = Column(String, unique=True, index=True)

    login_time = Column(DateTime, default=datetime.utcnow)
    logout_time = Column(DateTime, nullable=True)

    is_active = Column(Boolean, default=True)