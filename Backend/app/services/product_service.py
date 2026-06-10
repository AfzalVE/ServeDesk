from sqlalchemy.orm import Session

from app.models.product import Product


def create_product(
    db: Session,
    name: str,
    category: str,
    price: float,
    icon: str,
    available: bool = True
):

    product = Product(
        name=name,
        category=category,
        price=price,
        icon=icon,
        available=available
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


def get_all_products(
    db: Session
):

    return db.query(Product).all()


def get_available_products(
    db: Session
):

    return db.query(Product).filter(
        Product.available == True
    ).all()


def delete_product(
    db: Session,
    product_id: int
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        return None

    db.delete(product)
    db.commit()

    return product


def update_product_status(
    db: Session,
    product_id: int,
    available: bool
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        return None

    product.available = available

    db.commit()
    db.refresh(product)

    return product