from sqlalchemy.orm import Session

from app.models.order import Order


def create_order(
    db: Session,
    customer_id: int,
    product_id: int,
    quantity: int,
    message: str = ""
):

    order = Order(
        customer_id=customer_id,
        product_id=product_id,
        quantity=quantity,
        custom_message=message,
        status="PENDING"
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    return order


def get_all_orders(
    db: Session
):

    return db.query(Order).all()


def get_customer_orders(
    db: Session,
    customer_id: int
):

    return db.query(Order).filter(
        Order.customer_id == customer_id
    ).all()


def assign_employee(
    db: Session,
    order_id: int,
    employee_id: int
):

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        return None

    order.employee_id = employee_id
    order.status = "ASSIGNED"

    db.commit()
    db.refresh(order)

    return order


def update_order_status(
    db: Session,
    order_id: int,
    status: str
):

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        return None

    order.status = status

    db.commit()
    db.refresh(order)

    return order