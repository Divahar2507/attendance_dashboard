#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Create superuser automatically if variables are set
if [ "$DJANGO_SUPERUSER_USERNAME" ]; then
    python -c "from api.models import User; import os; \
    username=os.environ.get('DJANGO_SUPERUSER_USERNAME'); \
    email=os.environ.get('DJANGO_SUPERUSER_EMAIL'); \
    password=os.environ.get('DJANGO_SUPERUSER_PASSWORD'); \
    User.objects.filter(username=username).exists() or \
    User.objects.create_superuser(username, email, password)"
fi


