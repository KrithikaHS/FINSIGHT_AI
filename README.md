# Personal Expense Management and Financial Analytics

This is a full-stack personal expense management and financial analytics application. It consists of:

- **Backend:** Built with Django REST Framework, providing user authentication, expense tracking, receipt OCR processing, financial forecasting, budget optimization, and personalized recommendations.
- **Frontend:** A React web application that interacts with the backend API to provide a user-friendly interface for managing expenses and viewing financial insights.

## Features

### Backend
- User registration, login, profile, and password management with JWT authentication
- CRUD operations for expenses and recurring expenses
- Receipt image and text upload with OCR to extract expense data automatically
- Financial analytics including spending trends, forecasts, alerts, and budget optimization
- Personalized recommendations for smarter financial decisions

### Frontend
- User interface for managing expenses and profiles
- Upload receipts and view parsed expense details
- Visualize spending trends, category analytics, and forecasts
- Display alerts and budget optimization suggestions

## Technology Stack
- **Backend:** Django REST Framework, PostgreSQL/SQLite, Tesseract OCR, Facebook Prophet, Pandas
- **Frontend:** React
- **Authentication:** JWT tokens for secure communication between frontend and backend

## Getting Started

### Backend Setup
1. Clone the repository:
   ```
   git clone https://github.com/KrithikaHS/FINSIGHT_AI.git
    ```

2. Navigate to the backend directory:

   ```
   cd finsight_ai
   ```
3. Create and activate a virtual environment:

   ```
   python -m venv venv
   venv\Scripts\activate       
   ```
4. Install backend dependencies
5. Apply database migrations:

   ```
   python manage.py migrate
   ```
6. Run the backend server:

   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd finsight-ai-frontend
   ```
2. Install frontend dependencies:

   ```
   npm install
   ```
3. Start the frontend development server:

   ```
   npm start
   ```

## Usage

* Register and login through the frontend interface.
* Add expenses manually or by uploading receipts.
* View analytics dashboards and personalized recommendations.
* Manage budgets and receive alerts for better financial control.

