from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    IS_ADMIN = 'ADMIN'
    IS_EMPLOYEE = 'EMPLOYEE'
    
    ROLE_CHOICES = [
        (IS_ADMIN, 'Admin'),
        (IS_EMPLOYEE, 'Employee'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=IS_EMPLOYEE)
    employee_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    
    def __str__(self):
        return self.username

class EmployeeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    department = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    location = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default='On-Site')
    is_active_employee = models.BooleanField(default=True)
    joined_date = models.DateField(auto_now_add=True)
    date_of_birth = models.DateField(null=True, blank=True)

    # Detailed Info
    school_name = models.CharField(max_length=200, null=True, blank=True)
    school_year = models.CharField(max_length=10, null=True, blank=True)
    school_percentage = models.CharField(max_length=10, null=True, blank=True)

    college_name = models.CharField(max_length=200, null=True, blank=True)
    college_year = models.CharField(max_length=10, null=True, blank=True)
    college_cgpa = models.CharField(max_length=10, null=True, blank=True)

    address_line1 = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    zip_code = models.CharField(max_length=20, null=True, blank=True)

    skills = models.TextField(null=True, blank=True)
    interests = models.TextField(null=True, blank=True)
    hobbies = models.TextField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.designation}"

class EmployeeDocument(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50) # e.g., 'Resume', 'ID Proof', 'Offer Letter'
    file = models.FileField(upload_to='employee_documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.document_type}"

class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField(auto_now_add=True)
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='Absent') # Present, Absent, Half-Day
    location_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.date}"

class WorkUpdate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='work_updates')
    date = models.DateField(auto_now_add=True)
    project_name = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=50, default='In Progress') # In Progress, Completed, On Hold

    def __str__(self):
        return f"{self.user.username} - {self.project_name}"

class Ticket(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In_Progress', 'In Progress'),
        ('Review', 'Review'),
        ('Completed', 'Completed'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tickets')
    month = models.CharField(max_length=20)
    year = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

class TicketUpdate(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='updates')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    update_text = models.TextField()
    screenshot = models.ImageField(upload_to='ticket_updates/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Update on {self.ticket.title} by {self.user.username}"
