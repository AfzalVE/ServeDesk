from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
import uuid

from app.database import Base


# =========================
# ORDER MODEL
# =========================
class Order(Base):
    __tablename__ = "orders"

    # DB PRIMARY KEY
    id = Column(Integer, primary_key=True, index=True)

    # PUBLIC TRACKING ID (IMPORTANT)
    order_id = Column(
        String,
        unique=True,
        index=True,
        default=lambda: f"ORD-{uuid.uuid4().hex[:10].upper()}"
    )

    # RELATION
    customer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # PRODUCT ORDER (OPTIONAL → supports custom orders too)
    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=True
    )

    # CUSTOM ORDER SUPPORT
    custom_item_name = Column(String, nullable=True)
    custom_message = Column(String, nullable=True)

    quantity = Column(Integer, default=1)

    # STATUS FLOW
    status = Column(
        String,
        default="PENDING"
    )
    # PENDING
    # ACCEPTED
    # PREPARING
    # DELIVERED
    # CANCELLED

    # TIMESTAMP
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )