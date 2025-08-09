from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import StudentViewSet, SiteSettingsView, AboutUsView, HowItWorksListView, check_or_register_student

router = DefaultRouter()
router.register(r'students', StudentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('check_or_register/', check_or_register_student, name='check_or_register_student'),
    path('site-settings/', SiteSettingsView.as_view(), name='site-settings'),  
    path('about-us/', AboutUsView.as_view(), name='about-us'),
    path('how-it-works/', HowItWorksListView.as_view(), name='how-it-works-list'),

     
    path('dashboard/', views.DashboardAPIView.as_view(), name='dashboard-api'),
    path('statistics/', views.statistics_api, name='statistics-api'),
    path('faculties/', views.FacultyListAPIView.as_view(), name='faculty-list-api'),
    path('faculties/<str:faculty_code>/', views.FacultyDetailAPIView.as_view(), name='faculty-detail-api'),
     path('faculties/<str:faculty_code>/year/<int:year>/', views.faculty_courses_year_api, name='faculty-courses-year-api'),
    path('faculties/<str:faculty_code>/courses/<str:course_code>/', views.CourseDetailAPIView.as_view(), name='course-detail-api'),
    path('faculties/<str:faculty_code>/courses/<str:course_code>/<int:year>/year/<int:level>/', views.year_level_notes_api, name='year-level-notes-api'),
    path('search/', views.SearchNotesAPIView.as_view(), name='search-api'),
    path('notes/upload/', views.NoteUploadAPIView.as_view(), name='note-upload-api'),
    path('notes/<int:note_id>/delete/', views.NoteDeleteAPIView.as_view(), name='note-delete-api'),



   

]
