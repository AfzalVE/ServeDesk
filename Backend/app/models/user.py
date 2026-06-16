from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime,Boolean

from datetime import datetime

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    full_name = Column(
        String,
        nullable=False
    )

    employee_id = Column(
        String,
        unique=True,
        nullable=True
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    user_type = Column(
        String,
        nullable=False
    )
    # ADMIN
    # CUSTOMER
    # EMPLOYEE

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    is_active = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)