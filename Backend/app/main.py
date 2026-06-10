from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from app.database import Base, engine, get_db

# ==========================
# Schemas
# ==========================
from app.schemas import (
    SignUpSchema,
    SignInSchema,
    UserResponse,

    ProductCreateSchema,
    ProductResponse,

    OrderCreateSchema,
    OrderResponse,

    TicketCreateSchema,
    TicketResponse
)

# ==========================
# Services
# ==========================
from app.services.auth_service import create_user, authenticate_user

from app.services.product_service import (
    create_product,
    get_all_products,
    delete_product,
    update_product_status
)

from app.services.order_service import (
    create_order,
    get_all_orders,
    get_customer_orders,
    assign_employee,
    update_order_status
)

from app.services.ticket_service import (
    raise_ticket,
    get_all_tickets,
    assign_ticket,
    close_ticket
)

from app.services.employee_service import (
    get_all_employees,
    get_all_customers,
    get_admins
)

# ==========================
# Models (for seeding only)
# ==========================
from app.models.user import User
from app.models.product import Product
from app.utils.security import hash_password

# ==========================
# App Init
# ==========================
app = FastAPI(
    title="ServeDesk Backend",
    version="1.0.0"
)

# ==========================
# CORS
# ==========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# DB Create Tables
# ==========================
Base.metadata.create_all(bind=engine)

# ==========================
# Seed Database
# ==========================
def seed_database():
    db = Session(bind=engine)
    try:
        # -------------------------
        # Default Admin
        # -------------------------
        admin = db.query(User).filter(
            User.email == "admin@servedesk.com"
        ).first()

        if not admin:
            admin = User(
                full_name="ServeDesk Admin",
                employee_id="ADMIN001",
                email="admin@servedesk.com",
                password=hash_password("admin123"),
                user_type="ADMIN"
            )
            db.add(admin)

        # -------------------------
        # Sample Products
        # -------------------------
        if db.query(Product).count() == 0:
            products = [
                Product(name="Cold Coffee - Classic", category="Cold Coffee", price=80, icon="🧊", available=True),
                Product(name="Hot Coffee - Espresso", category="Hot Coffee", price=70, icon="☕", available=True),
                Product(name="Hot Coffee - Cappuccino", category="Hot Coffee", price=85, icon="☕", available=True),
                Product(name="Hot Coffee - Latte", category="Hot Coffee", price=90, icon="☕", available=True),
                Product(name="Hot Coffee - Mocha", category="Hot Coffee", price=100, icon="☕", available=True),
                Product(name="Mineral Water", category="Drinks", price=20, icon="💧", available=True),
                Product(name="Soft Drink", category="Drinks", price=40, icon="🥤", available=True),
                Product(name="Green Tea", category="Tea", price=50, icon="🍵", available=True),
                Product(name="Cookies", category="Snacks", price=35, icon="🍪", available=True),
                Product(name="Sandwich", category="Snacks", price=120, icon="🥪", available=True),
            ]
            db.add_all(products)

        db.commit()

    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    seed_database()

# ==========================
# HOME
# ==========================
@app.get("/")
def home():
    return {"message": "ServeDesk API Running"}

# ==========================
# AUTH
# ==========================
@app.post("/signup", response_model=UserResponse)
def signup(payload: SignUpSchema, db: Session = Depends(get_db)):

    user = create_user(
        db=db,
        full_name=payload.full_name,
        employee_id=payload.employee_id,
        email=payload.email,
        password=payload.password,
        user_type=payload.user_type
    )

    if not user:
        raise HTTPException(status_code=400, detail="User already exists")

    return user


@app.post("/signin")
def signin(payload: SignInSchema, db: Session = Depends(get_db)):

    user = authenticate_user(
        db=db,
        email=payload.email,
        password=payload.password
    )

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "employee_id": user.employee_id,
            "user_type": user.user_type
        }
    }

# ==========================
# PRODUCTS
# ==========================
@app.post("/products", response_model=ProductResponse)
def add_product(payload: ProductCreateSchema, db: Session = Depends(get_db)):

    return create_product(
        db=db,
        name=payload.name,
        category=payload.category,
        price=payload.price,
        icon=payload.icon,
        available=payload.available
    )


@app.get("/products")
def products(db: Session = Depends(get_db)):
    return get_all_products(db)


@app.delete("/products/{product_id}")
def remove_product(product_id: int, db: Session = Depends(get_db)):

    product = delete_product(db, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product deleted"}


@app.put("/products/{product_id}/status")
def product_status(product_id: int, available: bool, db: Session = Depends(get_db)):

    product = update_product_status(db, product_id, available)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product

# ==========================
# ORDERS
# ==========================
@app.post("/orders", response_model=OrderResponse)
def place_order(payload: OrderCreateSchema, db: Session = Depends(get_db)):

    return create_order(
        db=db,
        customer_id=payload.customer_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        message=payload.custom_message
    )


@app.get("/orders")
def orders(db: Session = Depends(get_db)):
    return get_all_orders(db)


@app.get("/orders/customer/{customer_id}")
def customer_orders(customer_id: int, db: Session = Depends(get_db)):

    return get_customer_orders(db, customer_id)


@app.put("/orders/{order_id}/assign")
def assign_order(order_id: int, employee_id: int, db: Session = Depends(get_db)):

    order = assign_employee(db, order_id, employee_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order


@app.put("/orders/{order_id}/status")
def change_order_status(order_id: int, status: str, db: Session = Depends(get_db)):

    order = update_order_status(db, order_id, status)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order

# ==========================
# TICKETS
# ==========================
@app.post("/tickets", response_model=TicketResponse)
def create_ticket(payload: TicketCreateSchema, db: Session = Depends(get_db)):

    return raise_ticket(
        db=db,
        customer_id=payload.customer_id,
        message=payload.message
    )


@app.get("/tickets")
def tickets(db: Session = Depends(get_db)):
    return get_all_tickets(db)


@app.put("/tickets/{ticket_id}/assign")
def assign_support(ticket_id: int, employee_id: int, db: Session = Depends(get_db)):

    ticket = assign_ticket(db, ticket_id, employee_id)

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return ticket


@app.put("/tickets/{ticket_id}/close")
def close_support(ticket_id: int, db: Session = Depends(get_db)):

    ticket = close_ticket(db, ticket_id)

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return ticket

# ==========================
# EMPLOYEE / ADMIN
# ==========================
@app.get("/employees")
def employees(db: Session = Depends(get_db)):
    return get_all_employees(db)


@app.get("/customers")
def customers(db: Session = Depends(get_db)):
    return get_all_customers(db)


@app.get("/admins")
def admins(db: Session = Depends(get_db)):
    return get_admins(db)