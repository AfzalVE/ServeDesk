from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
)
from datetime import datetime
import uuid

from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    order_id = Column(
        String,
        unique=True,
        index=True,
        default=lambda: f"ORD-{uuid.uuid4().hex[:10].upper()}"
    )

    customer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=True
    )

    custom_item_name = Column(
        String,
        nullable=True
    )

    custom_message = Column(
        String,
        nullable=True
    )

    quantity = Column(
        Integer,
        default=1
    )

    status = Column(
        String,
        default="PENDING"
    )

    # NEW COLUMN
    reject_reason = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )