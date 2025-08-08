from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, SiteSettingsView, AboutUsView, HowItWorksListView, check_or_register_student

router = DefaultRouter()
router.register(r'students', StudentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('check_or_register/', check_or_register_student, name='check_or_register_student'),
    path('site-settings/', SiteSettingsView.as_view(), name='site-settings'),  
    path('about-us/', AboutUsView.as_view(), name='about-us'),
    path('how-it-works/', HowItWorksListView.as_view(), name='how-it-works-list'),
]
