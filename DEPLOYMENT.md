# Deployment Guide for InfiniteTech Dashboard

This specific application uses:
- **Backend:** Django Rest Framework
- **Frontend:** React (Vite)
- **Database:** SQLite (default for development), PostgreSQL (recommended for production)

## 1. Backend Deployment

### Option A: Railway.app / Render.com (Simple & Often Free/Cheap)
1. **Prepare `requirements.txt`**: Ensure all python dependencies (Django, djangorestframework, uvicorn, gunicorn, whitenoise, Pillow, etc.) are listed.
   `pip freeze > requirements.txt`
2. **Create a `Procfile`** (for Heroku/Railway) or valid start command:
   `web: gunicorn config.wsgi:application --log-file -`
3. **Database**: Use the provided PostgreSQL database. Update `DATABASES` settings in `settings.py` to use `dj_database_url` or similar to parse the `DATABASE_URL` env variable.
4. **Static Files**: Install `whitenoise` to serve static files from Django.
   - Add `whitenoise.middleware.WhiteNoiseMiddleware` to `MIDDLEWARE`.
   - Set `STATIC_ROOT`.
5. **Environment Variables**: Set `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS=['*']` (or specific domain).

### Option B: VPS (DigitalOcean / AWS EC2) - More Control
1. SSH into server.
2. Install Python, Nginx, PostgreSQL.
3. Clone repo.
4. Setup Gunicorn to run Django.
5. Setup Nginx to proxy requests to Gunicorn (port 8000).

## 2. Frontend Deployment

### Option A: Vercel / Netlify (Recommended)
1. Push your code to GitHub.
2. Import the `frontend` folder as a project in Vercel.
3. Set Build Command: `npm run build`
4. Set Output Directory: `dist`
5. **Important:** Set Environment Variable for the API URL in Vercel.
   - `VITE_API_URL` = `https://your-backend-app.onrender.com/api` (Point to your live backend domain).
   - Update `frontend/services/api.js` to use `import.meta.env.VITE_API_URL` instead of hardcoded localhost.

### Option B: Serve via Django
1. Run `npm run build` locally.
2. Copy the `dist` folder contents to Django's `static` folder or a specific `templates` folder to serve `index.html`.

## 3. Database Switching
For production, **SQLite is NOT recommended**.
1. Update `backend/config/settings.py` to check for `DATABASE_URL`.
```python
import dj_database_url
import os

if os.environ.get('DATABASE_URL'):
    DATABASES['default'] = dj_database_url.config(conn_max_age=600)
```
2. Run `python manage.py migrate` on the production server.

## 4. Media Files (Profile Pics, Documents)
- On platforms like Heroku/Render, the filesystem is **ephemeral** (files deleted on restart).
- **Solution:** Use **AWS S3** or **Cloudinary** for media storage.
- Install `django-storages` and `boto3`.
- Configure `DEFAULT_FILE_STORAGE` to use S3.

## Checklist for Live Launch
- [ ] Connect Frontend `api.js` to Prod Backend URL.
- [ ] Set `DEBUG=False` in Backend.
- [ ] Run Migrations on Prod DB.
- [ ] Create Superuser on Prod DB.
- [ ] Configure CORS in Django to allow the Frontend Domain.
