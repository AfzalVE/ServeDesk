from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from typing import Optional
from fastapi import Query

from app.database import Base, engine, get_db
from fastapi import WebSocket 
from fastapi import WebSocketDisconnect 
from app.websocket_manager import (
    ticket_manager,
    order_manager,
)
from app.utils.auth_dependency import get_current_user
from fastapi.security import OAuth2PasswordBearer
from fastapi import WebSocket, WebSocketDisconnect


# ==========================
# Schemas
# ==========================
from app.schemas import (
    SignUpSchema,
    SignInSchema,
    UserResponse,
    UserUpdate,

    ProductCreateSchema,
    ProductResponse,

    OrderCreateSchema,
    OrderResponse,

    TicketCreate,
    TicketAssign,
    TicketReject,
    TicketResponse,

    AnnouncementCreate,
    AnnouncementResponse,
)



# ==========================
# Services
# ==========================
from app.services.auth_service import create_user, authenticate_user,logout_user


from app.services.product_service import (
    create_product,
    get_all_products,
    delete_product,
    update_product_status
)

from app.services.order_service import (
    create_order,
    get_all_orders,
    get_current_date_pending_orders,
    get_customer_orders,
    assign_employee,
    update_order_status
)

from app.services.ticket_service import (
    raise_ticket,
    get_all_tickets,
    get_customer_active_tickets,
    get_active_tickets,
    accept_ticket,
    reject_ticket,
    cancel_ticket,
    close_ticket
)
from app.services.employee_service import (
    get_all_employees,
    get_employee_by_id,
    get_active_employee,
    get_all_customers,
    get_admins,
    update_employee,
    delete_employee
)
from app.services.announcement_service import (
    create_announcement,
    get_all_announcements,
    get_today_announcements,
    get_announcement,
    update_announcement,
    delete_announcement,
)
# ==========================
# Models (for seeding only)
# ==========================
from app.models.user import User
from app.models.product import Product
from app.utils.security import hash_password
from app.schemas.push_token import PushTokenRequest

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

order_connections = []
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="signin"
)

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
def signup(
    payload: SignUpSchema,
    db: Session = Depends(get_db)
):

    user = create_user(
        db=db,
        full_name=payload.full_name,
        employee_id=payload.employee_id,
        email=payload.email,
        password=payload.password,
        user_type=payload.user_type
    )

    if not user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    return user


@app.post("/signin")
def signin(
    payload: SignInSchema,
    db: Session = Depends(get_db)
):

    result = authenticate_user(
        db=db,
        email=payload.email,
        password=payload.password
    )

    if not result:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    user = result["user"]

    return {
        "message": "Login successful",
        "access_token": result["access_token"],
        "token_type": result["token_type"],
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "employee_id": user.employee_id,
            "user_type": user.user_type,
            "is_active": user.is_active,
            "last_login": user.last_login,
            "created_at": user.created_at
        }
    }


@app.get("/me")
def me(
    current_user=Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "name": current_user.full_name,
        "email": current_user.email,
        "employee_id": current_user.employee_id,
        "user_type": current_user.user_type,
        "is_active": current_user.is_active,
        "last_login": current_user.last_login,
        "created_at": current_user.created_at
    }



@app.post("/logout")
def logout(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    success = logout_user(
        db=db,
        token=token
    )

    if not success:
        raise HTTPException(
            status_code=400,
            detail="Invalid session"
        )

    return {
        "message": "Logout successful"
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
@app.websocket("/ws/orders")
async def orders_ws(websocket: WebSocket):
    await order_manager.connect(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        order_manager.disconnect(websocket)


@app.post("/orders", response_model=OrderResponse)
async def place_order(payload: OrderCreateSchema, db: Session = Depends(get_db)):

    return await create_order(
        db=db,
        customer_id=payload.customer_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        message=payload.custom_message
    )


@app.get("/orders")
def get_orders(
    order_date: str | None = Query(
        default=None
    ),
    db: Session = Depends(get_db),
):
    return get_all_orders(
        db,
        order_date
    )

@app.get("/orders/pending/today")
def get_pending_orders(
    db: Session = Depends(get_db),
):
    return get_current_date_pending_orders(db)

@app.get("/orders/customer/{customer_id}")
def customer_orders(customer_id: int, db: Session = Depends(get_db)):

    return get_customer_orders(db, customer_id)


@app.put("/orders/{order_id}/assign")
async def assign_order(order_id: int, employee_id: int, db: Session = Depends(get_db)):

    order = await assign_employee(db, order_id, employee_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order




@app.put("/orders/{order_id}/status")
async def change_order_status(
    order_id: int,
    status: str,
    reject_reason: Optional[str] = None,
    db: Session = Depends(get_db)
):
    order = await update_order_status(
        db,
        order_id,
        status,
        reject_reason
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return order
# ==========================
# TICKETS
# ==========================
@app.websocket("/ws/tickets")
async def tickets_ws(websocket: WebSocket):
    await ticket_manager.connect(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ticket_manager.disconnect(websocket)


@app.post("/tickets", response_model=TicketResponse)
async def create_ticket(
    payload: TicketCreate,
    db: Session = Depends(get_db)
):

    ticket = raise_ticket(
        db=db,
        customer_id=payload.customer_id,
        employee_id=payload.employee_id,
        message=payload.message
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Customer or Employee not found"
        )

    return ticket
@app.get(
    "/tickets/active",
    response_model=list[TicketResponse]
)
async def active_tickets(
    db: Session = Depends(get_db)
):
    return get_active_tickets(db)

@app.get(
    "/tickets",
    response_model=list[TicketResponse]
)
async def tickets(
    db: Session = Depends(get_db)
):
    return get_all_tickets(db)

@app.get("/tickets/customer/{customer_id}",response_model=list[TicketResponse])
async def get_customer_tickets(customer_id: int,db: Session = Depends(get_db)):
    return get_customer_active_tickets(
        db=db,
        customer_id=customer_id
    )

@app.put("/tickets/{ticket_id}/accept")
async def accept_support(
    ticket_id: int,
    payload: TicketAssign,
    db: Session = Depends(get_db)
):

    ticket = accept_ticket(
        db=db,
        ticket_id=ticket_id,
        employee_id=payload.employee_id
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket


@app.put("/tickets/{ticket_id}/reject")
async def reject_support(
    ticket_id: int,
    payload: TicketReject,
    db: Session = Depends(get_db)
):

    ticket = reject_ticket(
        db=db,
        ticket_id=ticket_id,
        employee_id=payload.employee_id,
        reason=payload.reason
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket


@app.put("/tickets/{ticket_id}/cancel")
async def cancel_support(
    ticket_id: int,
    db: Session = Depends(get_db)
):

    ticket = cancel_ticket(
        db=db,
        ticket_id=ticket_id
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket


@app.put("/tickets/{ticket_id}/close")
async def close_support(
    ticket_id: int,
    db: Session = Depends(get_db)
):

    ticket = close_ticket(
        db=db,
        ticket_id=ticket_id
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket

# ==========================
# Announcements
# ==========================
@app.post(
    "/announcements",
    response_model=AnnouncementResponse,
)
def create_announcement_api(
    announcement: AnnouncementCreate,
    db: Session = Depends(
        get_db
    ),
):
    return create_announcement(
        db,
        announcement,
    )
@app.get(
    "/announcements",
    response_model=list[
        AnnouncementResponse
    ],
)
def get_announcements_api(
    db: Session = Depends(
        get_db
    ),
):
    return get_all_announcements(
        db
    )
@app.get(
    "/announcements/today",
    response_model=list[AnnouncementResponse] | None
)
def today_announcement(
    db: Session = Depends(get_db)
):
    print("came")
    return get_today_announcements(db)
@app.get(
    "/announcements/{announcement_id}",
    response_model=AnnouncementResponse,
)
def get_announcement_api(
    announcement_id: int,
    db: Session = Depends(
        get_db
    ),
):
    announcement = (
        get_announcement(
            db,
            announcement_id,
        )
    )

    if not announcement:
        raise HTTPException(
            status_code=404,
            detail="Announcement not found",
        )

    return announcement

@app.put(
    "/announcements/{announcement_id}",
    response_model=AnnouncementResponse,
)
def update_announcement_api(
    announcement_id: int,
    announcement: AnnouncementCreate,
    db: Session = Depends(
        get_db
    ),
):
    updated = (
        update_announcement(
            db,
            announcement_id,
            announcement,
        )
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Announcement not found",
        )

    return updated

@app.delete(
    "/announcements/{announcement_id}"
)
def delete_announcement_api(
    announcement_id: int,
    db: Session = Depends(
        get_db
    ),
):
    deleted = (
        delete_announcement(
            db,
            announcement_id,
        )
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Announcement not found",
        )

    return {
        "message":
        "Announcement deleted successfully"
    }
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

@app.get(
    "/employees/{employee_id}",
    response_model=UserResponse,
)
def employee(
    employee_id: int,
    db: Session = Depends(
        get_db
    ),
):
    employee = get_employee_by_id(
        db,
        employee_id,
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    return employee

@app.get("/active-employees",)
def active_employees(db: Session = Depends(get_db)):
    return get_active_employee(db)

@app.put(
    "/employees/{employee_id}",
    response_model=UserResponse,
)
def edit_employee(
    employee_id: int,
    user: UserUpdate,
    db: Session = Depends(
        get_db
    ),
):
    employee = update_employee(
        db,
        employee_id,
        user,
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    return employee

@app.delete(
    "/employees/{employee_id}"
)
def remove_employee(
    employee_id: int,
    db: Session = Depends(
        get_db
    ),
):
    deleted = delete_employee(
        db,
        employee_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    return {
        "message":
        "Employee deleted successfully"
    }

@app.post("/push-token")
def save_push_token(
    payload: PushTokenRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.id == payload.user_id)
        .first()
    )

    if not user:
        return {"error": "User not found"}

    user.expo_push_token = payload.push_token

    db.commit()

    return {"success": True}