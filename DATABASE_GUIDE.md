# Setting up the Database on Render (Critical)

For your live application, you cannot use the default database (SQLite) because Render deletes all local files (like `db.sqlite3`) every time your app restarts or updates. You **must** use a PostgreSQL database.

## Step 1: Create the Database
1.  Go to your **Render Dashboard**.
2.  Click **New +** -> **PostgreSQL**.
3.  **Name:** `attendance-db` (or anything you like).
4.  **Database:** Leave as default.
5.  **User:** Leave as default.
6.  **Region:** Choose the same region as your Web Service (e.g., Frankfurt or Singapore).
7.  **Plan:** Select **Free** (if available) or the cheapest plan.
8.  Click **Create Database**.

## Step 2: Connect it to your Backend
1.  Once the database is created, wait for it to be "Available".
2.  Look for the **Internal Database URL** section.
3.  Copy the connection string. It looks like: `postgres://attendance_db_user:password@hostname/attendance_db`.
4.  Go to your **Web Service** (the Python backend you created earlier).
5.  Go to **Environment** settings.
6.  Add a new Environment Variable:
    *   **Key:** `DATABASE_URL`
    *   **Value:** (Paste the Internal Database URL you just copied).
7.  **Save Changes**. Render will automatically restart your app.

## Step 3: Create the Admin User (One time only)
Since this is a brand new database, it is empty. You need to create your admin login.
1.  In your Web Service dashboard, go to the **Shell** tab (on the left).
2.  Wait for the terminal to connect.
3.  Run this command to create the tables:
    `python manage.py migrate`
4.  Run this command to create your login:
    `python manage.py createsuperuser`
5.  Enter a username (e.g., `admin`), email (can be fake), and password.

 Now you can log in to your live Admin Dashboard!
