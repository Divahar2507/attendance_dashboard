#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Create superuser automatically if variables are set
if [ "$DJANGO_SUPERUSER_USERNAME" ]; then
    python <<EOF
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from api.models import User
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
user = User.objects.filter(username=username).first()
if not user:
    User.objects.create_superuser(username, email, password, role='ADMIN')
    print(f"Superuser {username} created successfully.")
elif user.role != 'ADMIN':
    user.role = 'ADMIN'
    user.save()
    print(f"User {username} updated to ADMIN role.")
EOF
fi





