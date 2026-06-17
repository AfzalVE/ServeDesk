from sqlalchemy.orm import Session
from datetime import datetime
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.order import Order
from app.models.product import Product   # IMPORTANT ADD
from app.models.user import User       # IMPORTANT ADD
from app.websocket_manager import order_manager
import asyncio
from datetime import date
from app.services.notification_service import (
    send_push_notification
)
from app.services.employee_service import (
    get_active_employee
)   


# =========================
# CREATE ORDER
# =========================
async def create_order(
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

    enriched = enrich_order(db, order)

    print(
        "ORDER SOCKET COUNT:",
        len(order_manager.active_connections)
    )

    await order_manager.broadcast({
        "type": "order_created",
        "order": enriched
    })
    employees = get_active_employee(db)

    for employee in employees:

        if employee.expo_push_token:

            send_push_notification(
            employee.expo_push_token,
            "New Order",
            f"Order #{order.id} received",
            {
                "type": "order",
                "order_id": order.id
            }
)

    return enriched


# =========================
# GET ALL ORDERS
# =========================


def get_all_orders(
    db: Session,
    order_date: str = None
):
    query = db.query(Order)

    if order_date:
        try:
            datetime.strptime(
                order_date,
                "%Y-%m-%d"
            )

            query = query.filter(
                func.date(
                    Order.created_at
                ) == order_date
            )
        except ValueError:
            pass

    orders = (
        query.order_by(
            Order.created_at.desc()
        ).all()
    )

    return [
        enrich_order(db, order)
        for order in orders
    ]
# =========================
# GET CURRENT DATE & PENDING ORDERS
# =========================
def get_current_date_pending_orders(
    db: Session,
    order_date: str = None
):
    orders = (
        db.query(Order)
        .filter(
            Order.status == "PENDING",
            func.date(Order.created_at) == date.today()
        )
        .order_by(
            Order.created_at.desc()
        )
        .all()
    )

    return [
        enrich_order(db, order)
        for order in orders
    ]
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
async def assign_employee(db: Session, order_id: int, employee_id: int):

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        return None

    order.employee_id = employee_id
    order.status = "ASSIGNED"

    db.commit()
    db.refresh(order)

    enriched = enrich_order(db, order)

    await order_manager.broadcast({
            "type": "order_assigned",
            "order": enriched
        })
    

    return enriched


# =========================
# UPDATE STATUS
# =========================
async def update_order_status(
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

    enriched = enrich_order(db, order)

    await order_manager.broadcast({
            "type": "order_update",
            "order": enriched
        })
    

    return enriched


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
        "created_at":order.created_at.isoformat() if order.created_at else None,
    }