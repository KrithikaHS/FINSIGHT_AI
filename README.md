python manage.py generate_expenses
Me:Me@gmail.com

FinSight AI
FinSight AI — Intelligent Expense & Budget Management Platform
Leverages AI-powered analytics to track expenses, predict budgets, and optimize financial decisions.

FinSight AI is a full-stack application that enables users to securely log in, record income and expenses, set budgets, and get analytics-based insights. It’s built as a multi-user, JWT-protected REST API (Django) with a React frontend. The long-term aim is to incorporate ML features such as expense auto-categorization, anomaly detection, and month-end spend forecasting.

Secure user authentication (signup, login) with JWT.

Add / edit / delete expenses and income entries.

User-specific data isolation (each user sees only their records).

Filters: date range, category.

Interactive analytics-ready endpoints for frontend charts (monthly totals, category breakdown).

Export endpoints (CSV / PDF) — scaffold included.

Extensible hooks for AI features (auto-categorization, anomaly detection, forecasting).

Backend: Python, Django (lightweight views), PyMongo (MongoDB client), PyJWT, bcrypt

Database: MongoDB (local / Atlas)

Frontend: React (Create React App), axios, react-router-dom, Chart.js (or Recharts)

Optional ML libs (future): scikit-learn, pandas, transformers (for NLP), TensorFlow/PyTorch

Dev tooling: Postman/curl for API testing, Docker (optional for production)

Frontend (React): UI routes for Signup, Login, Dashboard, Expense Form, Expense List, Analytics charts. Stores JWT in localStorage and sends Authorization: Bearer <token> to API.

Backend (Django): REST endpoints for auth, expense CRUD, income CRUD, analytics endpoints. Uses PyMongo to interact directly with MongoDB. JWT decorator protects routes.

Database (MongoDB): Collections: users, expenses, income. Each expense and income document includes a user_id referencing the user _id.

AI / ML module (future): Separate service or module to train/predict (RAG, classification, regression). Can be integrated as internal calls or microservice.

Backend setup (Django + MongoDB)
Clone repo, cd to backend folder:

bash
Copy code
git clone <repo-url>
cd repo/backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r ../requirements.txt

Environment variables
Create a .env or export env vars (see section Environment variables). Example:

bash
Copy code
export FIN_ENV_SECRET="replace_with_a_strong_secret"
export MONGO_URI="mongodb://localhost:27017/expense_tracker_db"
Start backend server:

bash
Copy code
# ensure the mongo_connection.py uses MONGO_URI or localhost
python manage.py runserver 127.0.0.1:8000
Test health endpoint:

nginx
Copy code
GET http://127.0.0.1:8000/test/
Frontend setup (React)
In project root:

bash
Copy code
cd frontend
npm install
npm start
App should be available at http://localhost:3000

7. Environment variables
Store secrets in environment variables — do not hardcode secrets in source.

FIN_ENV_SECRET — JWT secret key

MONGO_URI — MongoDB connection string (e.g. mongodb://localhost:27017/expense_tracker_db)

DJANGO_SETTINGS_MODULE — Django settings if needed

FRONTEND_BASE_URL — (optional) frontend host for CORS whitelist

8. API reference (core)
All protected endpoints require header:
Authorization: Bearer <JWT_TOKEN>

Auth
POST /signup/ — create user

Body (JSON): { "name": "Alice", "email": "alice@example.com", "password": "pass1234" }

Returns: { "user_id": "<id>", "message": "User created successfully" }

POST /login/ — get token

Body (JSON): { "email": "alice@example.com", "password": "pass1234" }

Returns: { "token": "<jwt_token>" }

Expenses
POST /api/expenses/ — add expense

Body (JSON):

json
Copy code
{
  "amount": 250.0,
  "category": "Food",
  "date": "2025-08-09",
  "notes": "Lunch",
  "payment_method": "UPI"
}
Returns: { "message":"Expense added", "expense": { ... } }

GET /api/expenses/ — list expenses (user-only)

Query params (optional): from=YYYY-MM-DD&to=YYYY-MM-DD&category=Food

Returns: { "expenses": [ { expense objects... } ] }

GET /api/expenses/<id>/ — get expense detail

PUT /api/expenses/<id>/ — update expense (JSON fields same as POST)

DELETE /api/expenses/<id>/ — delete expense

Income
POST /api/income/ — add income (body similar to expense)

GET /api/income/ — list income (with filters similar to expenses)

Analytics (suggested endpoints)
GET /api/analytics/monthly-summary/?year=2025&month=8

Returns totals by category, total spend, total income, budget usage.

GET /api/analytics/forecast/

Returns forecasted month-end spend (future ML endpoint integration).

9. Database schema (MongoDB collections)
users
json
Copy code
{
  "_id": ObjectId,
  "name": "Alice",
  "email": "alice@example.com",
  "password": "<bcrypt hashed string>",
  "created_at": ISODate
}
expenses
json
Copy code
{
  "_id": ObjectId,
  "user_id": ObjectId,           // reference to users._id
  "amount": 250.00,
  "category": "Food",
  "date": "2025-08-09",          // stored as ISO date string YYYY-MM-DD
  "notes": "Lunch",
  "payment_method": "UPI",
  "created_at": ISODate,
  "updated_at": ISODate
}
income
json
Copy code
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "amount": 50000.00,
  "source": "Salary",
  "date": "2025-08-01",
  "notes": "",
  "created_at": ISODate
}
Indexes to add (recommended):

expenses.create_index([("user_id", 1), ("date", -1)])

income.create_index([("user_id", 1), ("date", -1)])

users.create_index("email", unique=True)

10. Testing & utilities
Use Postman / curl to test endpoints (examples in Section 8).

Unit tests: plan to add Django test cases for authentication flow and transaction CRUD.

DB seeding: add a small script to seed sample users and expenses for demo.

11. Production / deployment notes
Move secrets (JWT secret, DB URI) to environment variables or a secrets manager.

Use HTTPS (TLS) and set secure cookie flags if using cookies.

Consider containerization with Docker & orchestration via Docker Compose or Kubernetes.

Use MongoDB Atlas for production-grade DB with backups and monitoring.

Add logging, monitoring (Sentry), and rate limiting.

12. Roadmap / future enhancements (AI/ML)
Auto-Categorization: Train an NLP classifier to label expenses from notes/merchant.

Anomaly Detection: Flag unusual transactions via isolation forest or statistical methods.

Spending Forecast: Time-series forecasting (ARIMA/Prophet/ML) for month-end predictions.

Receipt OCR: Use Tesseract or Google Vision to parse receipts and auto-create expense entries.

Personalized Tips: Use rule-based + ML suggestions to recommend savings actions.

13. Resume-friendly summary / elevator pitch
FinSight AI — Intelligent Expense & Budget Management Platform
Built a secure, multi-user financial management system using Django, MongoDB and React. Implemented JWT authentication, expense & income CRUD, interactive analytics, budget alerts, and designed extensible ML hooks for future features (auto-categorization, anomaly detection, and forecasting).

Pitch for interviews: “I developed FinSight AI, a production-ready expense and budget management platform. It provides JWT-protected APIs, user-specific financial data, visual analytics for spending trends, and a roadmap to integrate ML features such as automated expense classification and month-end spend forecasting.”

14. Contributing & license
Contributions: open issues / create PRs with clear descriptions.

License: MIT (or pick the license your organization prefers).

"# FINSIGHT_AI" 
