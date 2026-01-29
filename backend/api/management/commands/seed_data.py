from django.core.management.base import BaseCommand
from api.models import User, EmployeeProfile

class Command(BaseCommand):
    help = 'Seeds the database with real-world employee data for existing employees'

    def handle(self, *args, **options):
        # 1. Create Admin
        admin_user, created = User.objects.get_or_create(username='admin', defaults={
            'email': 'admin@infinitetech.com',
            'role': User.IS_ADMIN
        })
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Superuser "admin" created'))
        else:
            if admin_user.role != User.IS_ADMIN:
                admin_user.role = User.IS_ADMIN
                admin_user.save()
                self.stdout.write(self.style.SUCCESS('Superuser "admin" role updated'))

        # 2. Populate Data for Existing Employees
        employees = User.objects.filter(role=User.IS_EMPLOYEE)
        
        if not employees.exists():
            self.stdout.write(self.style.WARNING('No employees found! Create an employee manually first, then run this script again to populate their data.'))
            return

        self.stdout.write(f'Found {employees.count()} employees. Generating data...')

        from api.models import Attendance, WorkUpdate, Ticket
        from django.utils import timezone
        import random
        from datetime import timedelta

        today = timezone.now().date()
        
        projects = ['Infinite UI', 'Backend API', 'Database Migration', 'AI Integration', 'Mobile App']
        descriptions = [
            'Implemented login functionality',
            'Fixed bugs in the dashboard',
            'Optimized database queries',
            'Designed new landing page',
            'Integrated payment gateway'
        ]

        for user in employees:
            # A. Attendance (Last 30 days)
            self.stdout.write(f'  - Generating attendance for {user.username}...')
            for i in range(30):
                date = today - timedelta(days=i)
                # Skip weekends
                if date.weekday() >= 5: 
                    continue
                
                # 90% chance of being present
                if random.random() < 0.9:
                    if Attendance.objects.filter(user=user, date=date).exists():
                        continue

                    in_hour = random.randint(8, 10)
                    in_min = random.randint(0, 59)
                    
                    # Random Check In/Out times
                    check_in = timezone.now().replace(year=date.year, month=date.month, day=date.day, hour=in_hour, minute=in_min)
                    check_out = check_in + timedelta(hours=8, minutes=random.randint(0, 60))

                    Attendance.objects.create(
                        user=user,
                        date=date,
                        status='Present',
                        check_in_time=check_in,
                        check_out_time=check_out,
                        location_verified=True
                    )
            
            # B. Work Updates
            self.stdout.write(f'  - Generating work updates for {user.username}...')
            for _ in range(5):
                 WorkUpdate.objects.create(
                     user=user,
                     date=today - timedelta(days=random.randint(1, 10)),
                     project_name=random.choice(projects),
                     description=random.choice(descriptions),
                     status=random.choice(['In Progress', 'Completed'])
                 )

        self.stdout.write(self.style.SUCCESS('Successfully populated data for all employees!'))
