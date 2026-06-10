from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.security import (
    hash_password,
    verify_password
)


def create_user(
    db: Session,
    full_name: str,
    employee_id: str,
    email: str,
    password: str,
    user_type: str
):

    existing = db.query(User).filter(
        (User.email == email) |
        (User.employee_id == employee_id)
    ).first()

    if existing:
        return None

    user = User(
        full_name=full_name,
        employee_id=employee_id,
        email=email,
        password=hash_password(password),
        user_type=user_type
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str
):

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        return None

    if not verify_password(
        password,
        user.password
    ):
        return None

    return user