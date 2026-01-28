from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthView, EmployeeViewSet, AttendanceView, EmployeeDocumentViewSet, WorkUpdateViewSet, TicketViewSet, TicketUpdateViewSet, MyTicketsView

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'documents', EmployeeDocumentViewSet, basename='document')
router.register(r'work-updates', WorkUpdateViewSet, basename='work_update')
router.register(r'tickets', TicketViewSet, basename='tickets')
router.register(r'updates', TicketUpdateViewSet, basename='ticket_updates')

urlpatterns = [
    path('auth/login/', AuthView.as_view(), name='login'),
    path('attendance/mark/', AttendanceView.as_view(), name='mark_attendance'),
    path('my-tickets/', MyTicketsView.as_view(), name='my_tickets'),
    path('', include(router.urls)),
]
