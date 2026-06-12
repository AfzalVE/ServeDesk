from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserUpdate

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


# ==========================
# GET SINGLE EMPLOYEE
# ==========================
def get_employee(
    db: Session,
    employee_id: int,
):
    return (
        db.query(User)
        .filter(
            User.id == employee_id
        )
        .first()
    )


# ==========================
# UPDATE EMPLOYEE
# ==========================
def update_employee(
    db: Session,
    employee_id: int,
    data: UserUpdate,
):
    employee = (
        db.query(User)
        .filter(
            User.id == employee_id
        )
        .first()
    )

    if not employee:
        return None

    employee.full_name = (
        data.full_name
    )

    employee.employee_id = (
        data.employee_id
    )

    employee.email = (
        data.email
    )

    employee.user_type = (
        data.user_type
    )

    db.commit()
    db.refresh(employee)

    return employee


# ==========================
# DELETE EMPLOYEE
# ==========================
def delete_employee(
    db: Session,
    employee_id: int,
):
    employee = (
        db.query(User)
        .filter(
            User.id == employee_id
        )
        .first()
    )

    if not employee:
        return False

    db.delete(employee)
    db.commit()

    return True