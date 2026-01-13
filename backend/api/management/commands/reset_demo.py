from django.core.management.base import BaseCommand
from api.models import User, EmployeeProfile, EmployeeDocument, Attendance, WorkUpdate

class Command(BaseCommand):
    help = 'Clears all data and re-creates only the admin user for a clean slate.'

    def handle(self, *args, **options):
        self.stdout.write('Clearing all existing data...')
        
        # Deleting Users will cascade delete Profiles, Attendance, Docs, Updates
        count = User.objects.all().count()
        User.objects.all().delete()
        
        self.stdout.write(f'Deleted {count} users and associated data.')

        # Create Admin
        self.stdout.write('Creating Admin user...')
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@infinitetech.com',
            password='admin123',
            first_name='System',
            last_name='Admin',
            role=User.IS_ADMIN,
            employee_id='IT-ADMIN'
        )
        
        # Create a profile for admin too, just in case
        EmployeeProfile.objects.create(
            user=admin_user,
            department='Administration',
            designation='Super Admin',
            phone_number='000-000-0000',
            location='HQ',
            status='On-Site'
        )

        self.stdout.write(self.style.SUCCESS(' Successfully reset database!'))
        self.stdout.write(self.style.SUCCESS(' Login credentials:'))
        self.stdout.write(self.style.SUCCESS(' Username: admin'))
        self.stdout.write(self.style.SUCCESS(' Password: admin123'))
