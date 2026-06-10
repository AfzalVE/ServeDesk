from pydantic import BaseModel
from datetime import datetime


class TicketCreate(BaseModel):
    customer_id: int
    message: str


class TicketAssign(BaseModel):
    employee_id: int


class TicketResponse(BaseModel):
    id: int
    customer_id: int
    employee_id: int | None
    status: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
