from pydantic import BaseModel
from datetime import datetime


class TicketCreate(BaseModel):
    customer_id: int
    employee_id: int | None = None
    message: str


class TicketAssign(BaseModel):
    employee_id: int


class TicketReject(BaseModel):
    employee_id: int
    reason: str


class TicketResponse(BaseModel):
    id: int

    customer_id: int
    customer_name: str

    requested_employee_id: int | None
    requested_employee_name: str | None

    accepted_employee_id: int | None
    accepted_employee_name: str | None
    accepted_at: datetime | None

    rejected_employee_id: int | None
    rejected_employee_name: str | None

    reject_reason: str | None

    status: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True