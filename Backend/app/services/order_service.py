from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.product import Product   # IMPORTANT ADD
from app.models.user import User       # IMPORTANT ADD


# =========================
# CREATE ORDER
# =========================
def create_order(
    db: Session,
    customer_id: int,
    product_id: int = None,
    quantity: int = 1,
    message: str = "",
    custom_item_name: str = None
):

    order = Order(
        customer_id=customer_id,
        product_id=product_id,
        quantity=quantity,
        custom_message=message,
        custom_item_name=custom_item_name,
        status="PENDING"
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    return enrich_order(db, order)


# =========================
# GET ALL ORDERS
# =========================
def get_all_orders(db: Session):
    orders = db.query(Order).all()
    return [enrich_order(db, o) for o in orders]


# =========================
# GET CUSTOMER ORDERS
# =========================
def get_customer_orders(db: Session, customer_id: int):
    orders = db.query(Order).filter(
        Order.customer_id == customer_id
    ).all()

    return [enrich_order(db, o) for o in orders]


# =========================
# ASSIGN EMPLOYEE
# =========================
def assign_employee(db: Session, order_id: int, employee_id: int):

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        return None

    order.employee_id = employee_id
    order.status = "ASSIGNED"

    db.commit()
    db.refresh(order)

    return enrich_order(db, order)


# =========================
# UPDATE STATUS
# =========================
def update_order_status(
    db: Session,
    order_id: int,
    status: str,
    reject_reason: str = None
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        return None

    order.status = status

    if status == "REJECTED":
        order.reject_reason = reject_reason

    db.commit()
    db.refresh(order)

    return order


# =========================
# ENRICH ORDER RESPONSE
# =========================
def enrich_order(db: Session, order: Order):

    product_name = None

    if order.product_id:
        product = db.query(Product).filter(
            Product.id == order.product_id
        ).first()

        if product:
            product_name = product.name
    if order.customer_id:
        customer = db.query(User).filter(
            User.id == order.customer_id
        ).first()

        if customer:
            customer_name = customer.full_name

    display_name = (
        product_name
        or order.custom_item_name
        or order.custom_message
        or "Custom Order"
    )

    return {
        "id": order.id,
        "order_id": order.order_id,
        "customer_id": order.customer_id,
        "customer_name": customer_name,
        "custom_item_name": order.custom_item_name,
        "custom_message": order.custom_message,
        "quantity": order.quantity,
        "reject_reason":order.reject_reason,
        "status": order.status,
        "display_name": display_name,
        "created_at": order.created_at,
    }