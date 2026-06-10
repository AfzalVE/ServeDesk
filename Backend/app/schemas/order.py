from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import uuid


# =========================
# ORDER CREATE (INPUT)
# =========================
class OrderCreate(BaseModel):
    customer_id: int
    product_id: Optional[int] = None
    quantity: int = 1
    custom_message: Optional[str] = None
    custom_item_name: Optional[str] = None  # for custom orders


# =========================
# ORDER ITEM (optional multi-item future)
# =========================
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


# =========================
# ORDER RESPONSE
# =========================
class OrderResponse(BaseModel):
    id: int
    order_id: str          # ✅ public tracking ID
    customer_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True