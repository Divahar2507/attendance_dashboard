# InfiniteTech Dashboard - Backend

This is the backend API for the InfiniteTech Dashboard, built with Django and Django REST Framework (DRF).

## 🛠️ Tech Stack
- **Framework:** Django 5.x
- **API:** Django REST Framework
- **Database:** SQLite (Default) / PostgreSQL (Supported via settings)
- **Authentication:** Token-based (Custom/Mock for dev, easily switchable to JWT)

## 🚀 Setup Instructions

### 1. Prerequisites
- Python 3.10+ installed.
- Virtual environment tool (built-in `venv`).

### 2. Create and Activate Virtual Environment
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Application Configuration (.env)
Ensure a `.env` file exists in the `backend` root (same level as `manage.py` or inside `config` depending on setup, but usually root).
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
# DB_NAME=... (If using Postgres)
# DB_USER=...
# DB_PASSWORD=...
```

### 5. Database Setup
Run migrations to create database tables.
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Seed Data (Important!)
Populate the database with the Admin user and dummy employees.
```bash
python manage.py seed_data
```
**Admin Credentials:**
- **Username:** `admin`
- **Password:** `admin123`

### 7. Run Server
```bash
python manage.py runserver
```
The API will be available at `http://localhost:8000/`.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login/` - Login and retrieve token/user info.

### Employees
- `GET /api/employees/` - List all employees.
- `POST /api/employees/` - Create a new employee (Admin only).
- `GET /api/employees/{id}/` - Retrieve specific employee details.

### Attendance (Geofenced)
- `POST /api/attendance/mark/` - Check-in/Check-out.
    - **Requires:** `user_id`, `latitude`, `longitude`.
    - **Geofence:** Must be within 100m of *37/5, Aryagowda Rd, Chennai*.

### Documents
- `GET /api/documents/` - List employee's uploaded documents.
- `POST /api/documents/` - Upload a new document (e.g., Resume, ID).

## 📂 Project Structure
- `api/` - Main app containing models, views, and serializers.
- `config/` - Project configuration (settings, urls).
- `manage.py` - Django CLI entry point.
