from rest_framework import serializers
from .models import User, EmployeeProfile, Attendance, EmployeeDocument, WorkUpdate, Ticket, TicketUpdate

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['id', 'user', 'date', 'check_in_time', 'check_out_time', 'status', 'location_verified']

class EmployeeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeProfile
        fields = [
            'department', 'designation', 'phone_number', 'location', 'status', 'is_active_employee', 'joined_date', 'date_of_birth',
            'school_name', 'school_year', 'school_percentage',
            'college_name', 'college_year', 'college_cgpa',
            'address_line1', 'city', 'state', 'zip_code',
            'skills', 'interests', 'hobbies', 'profile_picture',
            'gender', 'employee_type'
        ]

class EmployeeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeDocument
        fields = ['id', 'user', 'document_type', 'file', 'uploaded_at']
        read_only_fields = ['user']

class WorkUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkUpdate
        fields = ['id', 'user', 'date', 'project_name', 'description', 'status']
        read_only_fields = ['user']

class UserSerializer(serializers.ModelSerializer):
    profile = EmployeeProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'employee_id', 'profile', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class CreateEmployeeSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    employee_id = serializers.CharField()
    department = serializers.CharField(required=False, allow_blank=True)
    designation = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField()
    location = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    employee_type = serializers.CharField(required=False, allow_blank=True)

class TicketUpdateSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = TicketUpdate
        fields = ['id', 'ticket', 'user', 'user_name', 'update_text', 'screenshot', 'created_at']
        read_only_fields = ['user', 'created_at']

class TicketSerializer(serializers.ModelSerializer):
    assignee_name = serializers.SerializerMethodField()
    updates = TicketUpdateSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'title', 'description', 'status', 'assignee', 'assignee_name', 'created_by', 'month', 'year', 'created_at', 'updated_at', 'updates']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_assignee_name(self, obj):
        if obj.assignee:
            return f"{obj.assignee.first_name} {obj.assignee.last_name}"
        return None
