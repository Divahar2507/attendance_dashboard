from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthView, EmployeeViewSet, AttendanceView, EmployeeDocumentViewSet, WorkUpdateViewSet

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'documents', EmployeeDocumentViewSet, basename='document')
router.register(r'work-updates', WorkUpdateViewSet, basename='work_update')

urlpatterns = [
    path('auth/login/', AuthView.as_view(), name='login'),
    path('attendance/mark/', AttendanceView.as_view(), name='mark_attendance'),
    path('', include(router.urls)),
]
