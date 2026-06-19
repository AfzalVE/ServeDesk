# ServeDesk Backend API 🚀

FastAPI-based backend service for the ServeDesk office service management system. Handles orders, employees, support tickets, authentication, and real-time workflows.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [WebSocket Support](#websocket-support)
- [Services](#services)
- [Development](#development)

## ✨ Features

- **Order Management**: Create, track, assign, and update order statuses
- **Employee Management**: Manage employee profiles and work assignments
- **Support Tickets**: Real-time ticket creation and resolution tracking
- **User Authentication**: JWT-based authentication with role-based access control
- **Product Catalog**: Manage products and inventory
- **Announcements**: System-wide announcements for users
- **WebSocket Support**: Real-time communication for notifications
- **Email Validation**: Secure email validation for user registration
- **Firebase Integration**: Firebase Admin SDK for cloud messaging
- **Database Flexibility**: SQLite or PostgreSQL support

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI |
| Web Server | Uvicorn |
| ORM | SQLAlchemy |
| Data Validation | Pydantic |
| Authentication | JWT + Passlib (BCrypt) |
| Database | SQLite / PostgreSQL |
| Password Hashing | BCrypt |
| Email Validation | email-validator |
| Cloud Messaging | Firebase Admin |
| HTTP Client | Requests |

## 📥 Installation

### Prerequisites

- Python 3.8+
- pip or virtualenv

### Step 1: Clone Repository & Navigate to Backend

```bash
cd Backend
```

### Step 2: Create Virtual Environment (Recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `Backend` directory:

```env
# Database
DATABASE_URL=sqlite:///./test.db
# Or for PostgreSQL: postgresql://user:password@localhost/dbname

# JWT
JWT_SECRET_KEY=your-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60

# Firebase (optional)
FIREBASE_CREDENTIALS_PATH=./path/to/firebase-credentials.json

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,exp://localhost:19000

# Server
API_URL=http://localhost:8000
```

### Database Setup

To initialize the database:

```bash
python migrate.py
```

## 🚀 Running the Server

### Development Mode (with auto-reload)

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at: **http://localhost:8000**

API Documentation (Swagger UI): **http://localhost:8000/docs**

Alternative Docs (ReDoc): **http://localhost:8000/redoc**

## 📁 Project Structure

```
Backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── database.py             # Database configuration & session
│   ├── websocket_manager.py    # WebSocket connection management
│   │
│   ├── models/                 # SQLAlchemy ORM Models
│   │   ├── user.py
│   │   ├── order.py
│   │   ├── order_item.py
│   │   ├── product.py
│   │   ├── support_ticket.py
│   │   ├── session.py
│   │   ├── announcement.py
│   │   └── __init__.py
│   │
│   ├── schemas/                # Pydantic validation schemas
│   │   ├── user.py
│   │   ├── order.py
│   │   ├── product.py
│   │   ├── auth.py
│   │   ├── support_ticket.py
│   │   ├── announcement.py
│   │   ├── push_token.py
│   │   └── __init__.py
│   │
│   ├── services/               # Business logic
│   │   ├── user_service.py
│   │   ├── auth_service.py
│   │   ├── order_service.py
│   │   ├── product_service.py
│   │   ├── ticket_service.py
│   │   ├── employee_service.py
│   │   ├── announcement_service.py
│   │   ├── notification_service.py
│   │   └── __init__.py
│   │
│   └── utils/                  # Utility functions
│       ├── jwt.py              # JWT token operations
│       ├── security.py         # Password hashing
│       ├── auth_dependency.py  # FastAPI dependencies
│       └── __init__.py
│
├── requirements.txt            # Python dependencies
├── migrate.py                  # Database migration script
├── neon_console.py            # Neon database utilities
└── README.md                   # This file
```

## 🔌 API Endpoints

### Authentication
```
POST   /auth/signup          - Register new user
POST   /auth/login           - Login user (returns JWT)
POST   /auth/refresh         - Refresh JWT token
POST   /auth/logout          - Logout user
```

### Orders
```
GET    /orders               - Get all orders (admin/employee)
GET    /orders/customer/{id} - Get customer's orders
POST   /orders               - Create new order
GET    /orders/{id}          - Get order details
PUT    /orders/{id}          - Update order
PUT    /orders/{id}/status   - Update order status
PUT    /orders/{id}/assign   - Assign employee to order
DELETE /orders/{id}          - Delete order
```

### Products
```
GET    /products             - Get all products
GET    /products/{id}        - Get product details
POST   /products             - Create product (admin only)
PUT    /products/{id}        - Update product (admin only)
DELETE /products/{id}        - Delete product (admin only)
```

### Support Tickets
```
GET    /tickets              - Get all tickets
POST   /tickets              - Create support ticket
GET    /tickets/{id}         - Get ticket details
PUT    /tickets/{id}         - Update ticket
PUT    /tickets/{id}/status  - Update ticket status
DELETE /tickets/{id}         - Delete ticket
```

### Users
```
GET    /users                - Get all users (admin only)
GET    /users/{id}           - Get user details
PUT    /users/{id}           - Update user profile
DELETE /users/{id}           - Delete user (admin only)
```

### Announcements
```
GET    /announcements        - Get all announcements
POST   /announcements        - Create announcement (admin only)
GET    /announcements/{id}   - Get announcement details
PUT    /announcements/{id}   - Update announcement (admin only)
DELETE /announcements/{id}   - Delete announcement (admin only)
```

### Employees
```
GET    /employees            - Get all employees (admin/manager)
GET    /employees/{id}       - Get employee details
POST   /employees            - Create employee (admin only)
PUT    /employees/{id}       - Update employee (admin only)
DELETE /employees/{id}       - Delete employee (admin only)
```

## 💾 Database Models

### User
```python
- id: int (Primary Key)
- username: str (Unique)
- email: str (Unique)
- hashed_password: str
- full_name: str
- role: str (admin, employee, customer)
- is_active: bool
- created_at: datetime
- updated_at: datetime
```

### Order
```python
- id: int (Primary Key)
- customer_id: int (Foreign Key)
- assigned_employee_id: int (Foreign Key, nullable)
- status: str (PENDING, ACCEPTED, IN_PROGRESS, COMPLETED)
- description: str
- created_at: datetime
- updated_at: datetime
```

### Product
```python
- id: int (Primary Key)
- name: str
- description: str
- price: float
- created_at: datetime
- updated_at: datetime
```

### SupportTicket
```python
- id: int (Primary Key)
- user_id: int (Foreign Key)
- subject: str
- description: str
- status: str (OPEN, IN_PROGRESS, RESOLVED)
- created_at: datetime
- updated_at: datetime
```

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication:

1. User logs in with credentials
2. Server returns JWT token
3. Client includes token in `Authorization: Bearer <token>` header
4. Token expires after configured time (default: 60 minutes)
5. Use refresh endpoint to get new token

### User Roles
- **Admin**: Full system access, manage all resources
- **Employee**: Can view/update assigned orders and tickets
- **Customer**: Can create orders and support tickets

## 🔄 WebSocket Support

Real-time notifications via WebSocket:

```python
# Connect to WebSocket
ws://localhost:8000/ws/{user_id}

# Receive real-time updates for:
# - Order status changes
# - Ticket assignments
# - Announcements
# - Employee notifications
```

## 🧠 Services

Each service handles specific business logic:

| Service | Purpose |
|---------|---------|
| `user_service.py` | User CRUD operations |
| `auth_service.py` | Authentication & JWT management |
| `order_service.py` | Order management & status tracking |
| `product_service.py` | Product catalog management |
| `ticket_service.py` | Support ticket handling |
| `employee_service.py` | Employee management |
| `announcement_service.py` | System announcements |
| `notification_service.py` | Email & push notifications |

## 💻 Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black app/
```

### Linting

```bash
flake8 app/
```

### Type Checking

```bash
mypy app/
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Use different port
uvicorn app.main:app --reload --port 8001
```

### Database Connection Error
```bash
# Check DATABASE_URL in .env
# Ensure database service is running
python migrate.py  # Re-initialize database
```

### CORS Issues
```bash
# Update ALLOWED_ORIGINS in .env
# Include your frontend URL
```

## 📚 Additional Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [JWT.io](https://jwt.io/)

## 📝 License

This project is part of the ServeDesk office service management system.

---

**Last Updated**: 2024  
**Version**: 1.0.0
