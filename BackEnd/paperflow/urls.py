# urls.py - Enhanced with Preview and Payment System
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import StudentViewSet, SiteSettingsView, AboutUsView, HowItWorksListView, check_or_register_student

router = DefaultRouter()
router.register(r'students', StudentViewSet)

urlpatterns = [
    # Basic endpoints
    path('', include(router.urls)),
    path('check_or_register/', check_or_register_student, name='check_or_register_student'),
    path('site-settings/', SiteSettingsView.as_view(), name='site-settings'),
    path('about-us/', AboutUsView.as_view(), name='about-us'),
    path('how-it-works/', HowItWorksListView.as_view(), name='how-it-works-list'),

    # Dashboard and navigation
    path('dashboard/', views.DashboardAPIView.as_view(), name='dashboard-api'),
    path('statistics/', views.statistics_api, name='statistics-api'),

    # Faculty and course endpoints
    path('faculties/', views.FacultyListAPIView.as_view(), name='faculty-list-api'),
    path('faculties/<str:faculty_code>/', views.FacultyDetailAPIView.as_view(), name='faculty-detail-api'),
    path('faculties/<str:faculty_code>/year/<int:year>/', views.faculty_courses_year_api, name='faculty-courses-year-api'),
    path('faculties/<str:faculty_code>/courses/<str:course_code>/', views.CourseDetailAPIView.as_view(), name='course-detail-api'),

    # FIXED: Year level notes endpoint
    path(
        'faculties/<str:faculty_code>/courses/<str:course_code>/<int:year>/year/<int:level>/',
        views.year_level_notes_api,
        name='year-level-notes-api'
    ),

    # Note access endpoints (Preview system)
    path('notes/<int:note_id>/preview/', views.note_preview_api, name='note-preview-api'),
    path('notes/<int:note_id>/view/', views.note_view_api, name='note-view-api'),
    path('notes/<int:note_id>/download/', views.note_download_api, name='note-download-api'),  # Disabled during trial

    # File management
    path('notes/upload/', views.NoteUploadAPIView.as_view(), name='note-upload-api'),
    path('notes/<int:note_id>/delete/', views.NoteDeleteAPIView.as_view(), name='note-delete-api'),

    # Search
    path('search/', views.SearchNotesAPIView.as_view(), name='search-api'),

    # Student dashboard
    path('students/<int:student_id>/dashboard/', views.student_dashboard_api, name='student-dashboard-api'),

    # Payment system endpoints (for future activation)
    # path('payments/initiate/', views.initiate_payment_api, name='initiate-payment-api'),
    # path('payments/<int:payment_id>/verify/', views.verify_payment_api, name='verify-payment-api'),
    # path('payments/<int:payment_id>/status/', views.payment_status_api, name='payment-status-api'),

    # Access management
    # path('students/<int:student_id>/access/', views.student_access_api, name='student-access-api'),
    # path('notes/<int:note_id>/access/', views.note_access_stats_api, name='note-access-stats-api'),
]
