📌 ServeDesk – Office Service Management System

ServeDesk is a full-stack office service management platform designed to handle orders, employees, support tickets, and internal workflows in real time. It includes a React Native (Expo) mobile app frontend and a FastAPI backend with database support.

🚀 Features
📦 Order management system (create, assign, update status)
👨‍💼 Employee management module
🎫 Support ticket system (instant employee notification)
🧾 Custom order support with optional messages
📊 Admin dashboard for full control of operations
🔐 Authentication system (login / signup)
📱 Mobile-first UI using React Native + Expo
⚡ Real-time workflow updates via API integration
🏗️ Tech Stack
Frontend
React Native (Expo)
TypeScript
Expo Router
AsyncStorage
Backend
FastAPI
SQLAlchemy
Pydantic
Uvicorn
Database
SQLite / PostgreSQL (configurable)
📂 Project Structure
ServeDesk/
│
├── frontend/ (React Native App)
│   ├── app/
│   │   ├── admin/
│   │   ├── employee/
│   │   ├── customer/
│   │   └── auth/
│   ├── components/
│   └── config/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── database.py
⚙️ Installation & Setup
1. Clone the repository
git clone https://github.com/your-repo/servedesk.git
cd servedesk
2. Backend Setup (FastAPI)
cd backend
pip install -r requirements.txt

Run server:

uvicorn app.main:app --reload

Backend runs at:

http://localhost:8000
3. Frontend Setup (React Native Expo)
cd frontend
npm install
npx expo start
📡 API Endpoints
Orders
GET /orders → Get all orders
GET /orders/customer/{id} → Get customer orders
PUT /orders/{id}/status?status=ACCEPTED → Update order status
PUT /orders/{id}/assign → Assign employee
Tickets
POST /tickets → Create support ticket
Products
GET /products → Fetch products
👥 User Roles
🧑 Customer
Place orders
Raise support tickets
Track order status
👨‍💼 Employee
View assigned orders
Update order status
Handle support tickets
🛠️ Admin
Manage products
Manage employees
Monitor all orders
View system analytics
🔥 Key Learnings
Full-stack app architecture (mobile + backend)
API design using REST principles
State management in React Native
Database modeling with SQLAlchemy
Role-based system design
Real-time workflow handling
🚀 Future Improvements
Web dashboard for admin panel
Real-time WebSocket notifications
Payment integration
Advanced analytics dashboard
Push notifications for employees
📜 License

This project is for educational and development purposes