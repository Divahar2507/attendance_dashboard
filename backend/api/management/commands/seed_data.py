from django.core.management.base import BaseCommand
from api.models import User, EmployeeProfile
from faker import Faker
import random

class Command(BaseCommand):
    help = 'Seeds the database with real-world employee data'

    def handle(self, *args, **options):
        fake = Faker()
        
        # Create Admin
        # Create or Update Admin to ensure correct role
        admin_user, created = User.objects.get_or_create(username='admin', defaults={
            'email': 'admin@infinitetech.com',
            'role': User.IS_ADMIN
        })
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Superuser "admin" created (pass: admin123)'))
        else:
            if admin_user.role != User.IS_ADMIN:
                admin_user.role = User.IS_ADMIN
                admin_user.save()
                self.stdout.write(self.style.SUCCESS('Superuser "admin" role updated to ADMIN'))

        departments = ['AI Research', 'Cloud Infra', 'Operations', 'Engineering', 'HR']
        can_roles = ['Software Engineer', 'Data Scientist', 'HR Manager', 'DevOps Engineer', 'Product Manager']
        
        self.stdout.write('Seeding 20 employees...')
        
        for _ in range(20):
            first_name = fake.first_name()
            last_name = fake.last_name()
            username = f"{first_name.lower()}.{last_name.lower()}"
            if User.objects.filter(username=username).exists():
                continue
                
            user = User.objects.create_user(
                username=username,
                email=f"{username}@infinitetech.com",
                password='password123',
                first_name=first_name,
                last_name=last_name,
                role=User.IS_EMPLOYEE,
                employee_id=f"IT-{random.randint(100, 999)}"
            )
            
            EmployeeProfile.objects.create(
                user=user,
                department=random.choice(departments),
                designation=random.choice(can_roles),
                phone_number=fake.phone_number(),
                location=fake.city(),
                status=random.choice(['On-Site', 'Remote', 'On-Leave'])
            )
            
        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
