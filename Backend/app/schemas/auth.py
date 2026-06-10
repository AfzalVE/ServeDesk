from pydantic import BaseModel
from typing import Optional


class SignUpSchema(BaseModel):
    full_name: str
    employee_id: Optional[str] = None
    email: str
    password: str
    user_type: str


class SignInSchema(BaseModel):
    email: str
    password: str
