from django.core.management.base import BaseCommand
from api.models import User, EmployeeProfile

class Command(BaseCommand):
    help = 'Seeds the database with real-world employee data'

    def handle(self, *args, **options):
        # Admin creation logic starts here
        
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
        
        # Employee seeding removed as per request
        self.stdout.write(self.style.SUCCESS('Skipping employee seeding, only Admin user ensured.'))
            
        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
