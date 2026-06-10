from sqlalchemy.orm import Session

from app.models.user import User


def get_all_employees(
    db: Session
):

    return db.query(User).filter(
        User.user_type == "EMPLOYEE"
    ).all()


def get_employee_by_id(
    db: Session,
    employee_id: int
):

    return db.query(User).filter(
        User.id == employee_id
    ).first()


def get_all_customers(
    db: Session
):

    return db.query(User).filter(
        User.user_type == "CUSTOMER"
    ).all()


def get_admins(
    db: Session
):

    return db.query(User).filter(
        User.user_type == "ADMIN"
    ).all()