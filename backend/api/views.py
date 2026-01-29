from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import User, EmployeeProfile
from .serializers import UserSerializer, CreateEmployeeSerializer

class AuthView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            try:
                user_data = UserSerializer(user).data
            except Exception as e:
                print(f"SERIALIZER ERROR: {e}")
                import traceback
                traceback.print_exc()
                return Response({'error': f"Serializer Error: {str(e)}"}, status=500)
            
            return Response({
                'token': token.key,
                'user': user_data
            })
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(role=User.IS_EMPLOYEE)
    serializer_class = UserSerializer
    # permission_classes = [permissions.IsAuthenticated] # Uncomment when Auth is fully ready

    def create(self, request):
        serializer = CreateEmployeeSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                role=User.IS_EMPLOYEE,
                employee_id=data['employee_id']
            )
            EmployeeProfile.objects.create(
                user=user,
                department=data.get('department', 'Unassigned'),
                designation=data.get('designation', 'Trainee'),
                phone_number=data['phone_number'],
                location=data.get('location', 'Head Office'),
                date_of_birth=data.get('date_of_birth')
            )
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_profile(self, request):
        user = request.user
        if not hasattr(user, 'profile'):
             return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        from .serializers import EmployeeProfileSerializer
        serializer = EmployeeProfileSerializer(user.profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from .models import EmployeeDocument
from .serializers import EmployeeDocumentSerializer
from rest_framework.parsers import MultiPartParser, FormParser

class EmployeeDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        # Allow Admin to see all or filter by user_id
        if self.request.user.role == User.IS_ADMIN:
            user_id = self.request.query_params.get('user_id')
            if user_id:
                return EmployeeDocument.objects.filter(user_id=user_id)
            return EmployeeDocument.objects.all()
        # Employees only see their own
        return EmployeeDocument.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from .models import WorkUpdate
from .serializers import WorkUpdateSerializer

class WorkUpdateViewSet(viewsets.ModelViewSet):
    serializer_class = WorkUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        # If Admin, can filter by any user
        if self.request.user.role == User.IS_ADMIN and user_id:
             return WorkUpdate.objects.filter(user_id=user_id)
        # Otherwise show own updates (or all if admin checks without filter)
        if self.request.user.role == User.IS_EMPLOYEE:
             return WorkUpdate.objects.filter(user=self.request.user)
        return WorkUpdate.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from .models import Attendance
from .serializers import AttendanceSerializer
from django.utils import timezone
from math import radians, sin, cos, sqrt, atan2

class AttendanceView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        
        if not user_id or not lat or not lng:
             return Response({'error': 'Missing location data'}, status=status.HTTP_400_BAD_REQUEST)

        # Office Coordinates: 37/5, Aryagowda Rd... Chennai 600033
        # Office Coordinates: 37/5, Aryagowda Rd, Chennai - from User provided map link
        OFFICE_LAT = 13.0360406
        OFFICE_LNG = 80.2181952
        ALLOWED_RADIUS_METERS = 200 # Enforce 200m radius

        # Haversine Formula
        R = 6371000 # Radius of Earth in meters
        dlat = radians(float(lat) - OFFICE_LAT)
        dlon = radians(float(lng) - OFFICE_LNG)
        a = sin(dlat / 2)**2 + cos(radians(OFFICE_LAT)) * cos(radians(float(lat))) * sin(dlon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        distance = R * c
        
        print(f"DEBUG: User Lat: {lat}, User Lng: {lng}, Distance: {distance}m") # Debug log

        if distance > ALLOWED_RADIUS_METERS:
             return Response({
                 'error': 'You are currently not at the office location.',
                 'distance': f"{int(distance)} meters away"
             }, status=status.HTTP_403_FORBIDDEN)
        
        try:
             user = User.objects.get(id=user_id)
        except User.DoesNotExist:
             return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check in or Check out
        today = timezone.now().date()
        attendance, created = Attendance.objects.get_or_create(user=user, date=today)
        
        if not attendance.check_in_time:
             attendance.check_in_time = timezone.now()
             attendance.status = 'Present'
             attendance.location_verified = True
             attendance.save()
             message = "Check-in successful!"
        elif not attendance.check_out_time:
             attendance.check_out_time = timezone.now()
             attendance.save()
             message = "Check-out successful!"
        else:
             message = "Already checked out for today."

        return Response({
             'message': message,
             'distance': f"{int(distance)} meters",
             'data': AttendanceSerializer(attendance).data
        })

    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'Missing user_id parameter'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
             # Validate user exists
             User.objects.get(id=user_id)
        except User.DoesNotExist:
             return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        history = Attendance.objects.filter(user_id=user_id).order_by('-date')
        serializer = AttendanceSerializer(history, many=True)
        return Response(serializer.data)

from .models import Ticket, TicketUpdate
from .serializers import TicketSerializer, TicketUpdateSerializer

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Admin sees all, Employee sees pool (unassigned) or their own?
        # Frontend logic seems to separate "Mine" vs "Pool" in UI, but asks for all tickets or specific endpoints.
        # UserDashboard: '/tickets' -> Pool? No, fetchTickets fetches all.
        # But 'poolTickets' filter: !t.userId.
        # So '/tickets' should probably return ALL tickets or Open tickets.
        return Ticket.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class MyTicketsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tickets = Ticket.objects.filter(assignee=request.user).order_by('-created_at')
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)

class TicketUpdateViewSet(viewsets.ModelViewSet):
    queryset = TicketUpdate.objects.all()
    serializer_class = TicketUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        # Flatten data for screenshot upload if needed, or DRF handles it
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=self.request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
