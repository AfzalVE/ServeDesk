from pydantic import BaseModel
from datetime import datetime


class UserUpdate(BaseModel):
    full_name: str
    employee_id: str | None = None
    email: str
    user_type: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    employee_id: str | None
    email: str
    user_type: str
    created_at: datetime

    class Config:
        from_attributes = True