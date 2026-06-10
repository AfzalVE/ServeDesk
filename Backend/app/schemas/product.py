from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    icon: str
    category: str
    price: float


class ProductUpdate(BaseModel):
    name: str
    icon: str
    category: str
    price: float
    available: bool


class ProductResponse(BaseModel):
    id: int
    name: str
    icon: str
    category: str
    price: float
    available: bool

    class Config:
        from_attributes = True

