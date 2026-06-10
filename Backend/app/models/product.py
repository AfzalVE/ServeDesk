from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import Boolean

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    icon = Column(
        String,
        nullable=True
    )

    category = Column(
        String,
        nullable=False
    )

    price = Column(
        Float,
        default=0
    )

    available = Column(
        Boolean,
        default=True
    )

