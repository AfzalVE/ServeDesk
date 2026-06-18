from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserUpdate
from sqlalchemy.orm import Session


# ==========================
# GET EMPLOYEES
# ==========================
def get_all_employees(
    db: Session,
):
    return (
        db.query(User)
        .filter(
            User.user_type == "EMPLOYEE"
        )
        .order_by(
            User.created_at.desc()
        )
        .all()
    )






def save_push_token(
    db: Session,
    user_id: int,
    push_token: str
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        return None

    user.expo_push_token = push_token

    db.commit()
    db.refresh(user)

    return user
