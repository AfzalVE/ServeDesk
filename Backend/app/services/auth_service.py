# app/auth/auth_service.py
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from datetime import datetime
from app.models.user import User
from app.models.session import UserSession
from app.utils.security import hash_password, verify_password
from app.utils.jwt import create_access_token


# ---------------- REGISTER ----------------
def create_user(db: Session, full_name, employee_id, email, password, user_type):

    existing = db.query(User).filter(
        (User.email == email) | (User.employee_id == employee_id)
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


# ---------------- LOGIN ----------------
def authenticate_user(db: Session, email: str, password: str):

    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    # mark user active
    user.is_active = True
    user.last_login = datetime.utcnow()

    # create JWT
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )

    # create session record
    session = UserSession(
        user_id=user.id,
        token=access_token,
        is_active=True
    )

    db.add(session)
    db.commit()
    db.refresh(user)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

#Update Profile

def update_user_profile(
    db: Session,
    user_id: int,
    full_name: str,
    employee_id: str,
    email: str
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return None

    existing = db.query(User).filter(
        User.email == email,
        User.id != user_id
    ).first()

    if existing:
        return {
            "success": False,
            "message": "Email already exists"
        }

    user.full_name = full_name
    user.employee_id = employee_id
    user.email = email

    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "Profile updated successfully",
        "user": user
    }

#Change Password
def change_user_password(
    db: Session,
    user_id: int,
    current_password: str,
    new_password: str
):
    print("Change Password Entry ")

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {
            "success": False,
            "message": "User not found"
        }

    if not verify_password(
        current_password,
        user.password
    ):
        return {
            "success": False,
            "message": "Current password is incorrect"
        }

    user.password = hash_password(
        new_password
    )

    db.commit()

    return {
        "success": True,
        "message": "Password changed successfully"
    }
# ---------------- LOGOUT ----------------


def logout_user(
    db: Session,
    token: str
):

    session = db.query(UserSession).filter(
        UserSession.token == token,
        UserSession.is_active == True
    ).first()
    

    if not session:
        return False

    session.is_active = False
    session.logout_time = datetime.utcnow()

    user = db.query(User).filter(
        User.id == session.user_id
    ).first()

    if user:
        user.is_active = False

    db.commit()

    return True