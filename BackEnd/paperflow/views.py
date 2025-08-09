from django.shortcuts import render
from rest_framework import viewsets,status
from .models import Student, SiteSettings, AboutUs, HowItWorks
from .serializers import StudentSerializer,SiteSettingsSerializer, AboutUsSerializer, HowItWorksSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SiteSettings
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404

# Create your views here.


class SiteSettingsView(APIView):
    def get(self, request):
        try:
            site_settings = SiteSettings.objects.first()
            if site_settings:
                serializer = SiteSettingsSerializer(site_settings, context={'request': request})
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({"detail": "Site settings not configured."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer


@api_view(['POST'])
def check_or_register_student(request):
    email = request.data.get('email')

    if not email:
        return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        student = Student.objects.get(email=email)
        serializer = StudentSerializer(student)
        return Response({
            "status": "exists",
            "student": serializer.data
        }, status=status.HTTP_200_OK)
    
    except Student.DoesNotExist:
        # Not registered before, create new student
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "created",
                "student": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AboutUsView(APIView):
    def get(self, request):
        about = AboutUs.objects.first()
        if about:
            serializer = AboutUsSerializer(about, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({"detail": "AboutUs information not configured."}, status=status.HTTP_404_NOT_FOUND)



class HowItWorksListView(APIView):
    def get(self, request):
        steps = HowItWorks.objects.all().order_by('step_number')
        serializer = HowItWorksSerializer(steps, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)





# views.py
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Prefetch
from .models import Faculty, Course, AcademicYear, YearLevel, Semester, Note
from .serializers import (
    FacultyListSerializer, FacultyDetailSerializer, CourseDetailSerializer,
    DashboardSerializer, YearLevelWithCoursesSerializer, NoteSerializer,
    NoteUploadSerializer, SearchResultSerializer, YearLevelSerializer,
    SemesterSerializer
)


# 🏠 DASHBOARD API
class DashboardAPIView(generics.ListAPIView):
    """
    Main Dashboard API - Returns all faculties with their courses
    Perfect for your React dashboard with faculty cards
    
    GET /api/dashboard/
    
    Returns:
    [
        {
            "id": 1,
            "name": "Faculty of Computing",
            "code": "FoCLICS", 
            "courses": {
                "all": [...],
                "pairs": [[course1, course2], [course3, course4]]
            }
        }
    ]
    """
    queryset = Faculty.objects.prefetch_related('courses').all()
    serializer_class = DashboardSerializer


# 🧭 COURSE DETAIL API
class CourseDetailAPIView(generics.RetrieveAPIView):
    """
    Course Detail API - Returns full course structure with academic years
    
    GET /api/faculties/{faculty_code}/courses/{course_code}/
    
    Returns complete nested structure:
    Faculty → Course → Academic Years → Year Levels → Semesters → Notes
    """
    serializer_class = CourseDetailSerializer
    lookup_url_kwarg = 'course_code'
    
    def get_object(self):
        faculty_code = self.kwargs['faculty_code']
        course_code = self.kwargs['course_code']
        
        faculty = get_object_or_404(Faculty, code__iexact=faculty_code)
        course = get_object_or_404(
            Course.objects.prefetch_related(
                'academic_years__year_levels__semesters__notes'
            ), 
            faculty=faculty, 
            code__iexact=course_code
        )
        return course
    
    def retrieve(self, request, *args, **kwargs):
        course = self.get_object()
        faculty = course.faculty
        
        # Get all courses in this faculty for navigation
        all_courses = faculty.courses.all()
        
        serializer = self.get_serializer(course)
        
        return Response({
            'faculty': {
                'id': faculty.id,
                'name': faculty.name,
                'code': faculty.code,
                'description': faculty.description
            },
            'course': serializer.data,
            'all_courses': [
                {'id': c.id, 'name': c.name, 'code': c.code} 
                for c in all_courses
            ]
        })


# 📅 FACULTY COURSES BY YEAR API (For hover functionality)
@api_view(['GET'])
def faculty_courses_year_api(request, faculty_code, year):
    """
    API for getting all courses in a faculty with their year levels for specific year
    Used for hover functionality you described
    
    GET /api/faculties/{faculty_code}/year/{year}/
    
    Returns:
    {
        "faculty_name": "Faculty of Computing",
        "faculty_code": "FoCLICS",
        "year": 2024,
        "courses": [
            {
                "id": 1,
                "name": "Bachelor of Computer Science", 
                "code": "BCS",
                "year_levels": [
                    {"id": 1, "level": 1, "name": "Year 1"},
                    {"id": 2, "level": 2, "name": "Year 2"}
                ]
            }
        ]
    }
    """
    faculty = get_object_or_404(Faculty, code__iexact=faculty_code)
    courses = faculty.courses.all()
    
    # Add year context for serializer
    serializer = YearLevelWithCoursesSerializer(
        courses, 
        many=True, 
        context={'year': year, 'request': request}
    )
    
    return Response({
        'faculty_name': faculty.name,
        'faculty_code': faculty.code,
        'year': year,
        'courses': serializer.data
    })


# 📦 YEAR LEVEL NOTES API
@api_view(['GET'])
def year_level_notes_api(request, faculty_code, course_code, year, level):
    """
    Get all notes for a specific year level
    Used when user clicks on "Year 1", "Year 2", etc.
    
    GET /api/faculties/{faculty_code}/courses/{course_code}/{year}/year/{level}/
    
    Returns:
    {
        "year_level": {...},
        "semesters": [
            {
                "semester": {...},
                "notes": [...]
            }
        ]
    }
    """
    faculty = get_object_or_404(Faculty, code__iexact=faculty_code)
    course = get_object_or_404(Course, faculty=faculty, code__iexact=course_code)
    academic_year = get_object_or_404(AcademicYear, course=course, year=year)
    year_level = get_object_or_404(
        YearLevel.objects.prefetch_related('semesters__notes'), 
        academic_year=academic_year, 
        level=level
    )
    
    serializer = YearLevelSerializer(year_level, context={'request': request})
    
    return Response({
        'faculty': {'name': faculty.name, 'code': faculty.code},
        'course': {'name': course.name, 'code': course.code},
        'academic_year': academic_year.year,
        'year_level': serializer.data
    })


# 🔍 SEARCH API
class SearchNotesAPIView(generics.ListAPIView):
    """
    Search API for finding notes across the entire system
    
    GET /api/search/?q=python&faculty=foclics&course=bcs&year=2024
    
    Query parameters:
    - q: Search term (searches in title and description)
    - faculty: Filter by faculty code
    - course: Filter by course code  
    - year: Filter by academic year
    - note_type: Filter by note type
    """
    serializer_class = SearchResultSerializer
    
    def get_queryset(self):
        queryset = Note.objects.select_related(
            'semester__year_level__academic_year__course__faculty'
        ).all()
        
        # Search query
        search_query = self.request.query_params.get('q', '')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(description__icontains=search_query)
            )
        
        # Filters
        faculty_code = self.request.query_params.get('faculty', '')
        if faculty_code:
            queryset = queryset.filter(
                semester__year_level__academic_year__course__faculty__code__iexact=faculty_code
            )
        
        course_code = self.request.query_params.get('course', '')
        if course_code:
            queryset = queryset.filter(
                semester__year_level__academic_year__course__code__iexact=course_code
            )
        
        year = self.request.query_params.get('year', '')
        if year:
            queryset = queryset.filter(
                semester__year_level__academic_year__year=year
            )
        
        note_type = self.request.query_params.get('note_type', '')
        if note_type:
            queryset = queryset.filter(note_type=note_type)
        
        return queryset.order_by('-uploaded_at')[:100]  # Limit results


# 📤 FILE UPLOAD API
class NoteUploadAPIView(generics.CreateAPIView):
    """
    Upload new notes/files
    
    POST /api/notes/upload/
    
    Body:
    {
        "title": "Python Basics Lecture",
        "description": "Introduction to Python programming",
        "file": <file>,
        "note_type": "lecture", 
        "semester": 1  // semester ID
    }
    """
    serializer_class = NoteUploadSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note = serializer.save()
        
        # Return full note data with context
        response_serializer = SearchResultSerializer(note, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


# 📋 FACULTY LIST API
class FacultyListAPIView(generics.ListAPIView):
    """
    Simple list of all faculties
    GET /api/faculties/
    """
    queryset = Faculty.objects.all()
    serializer_class = FacultyListSerializer


# 🏫 FACULTY DETAIL API
class FacultyDetailAPIView(generics.RetrieveAPIView):
    """
    Detailed faculty information with all courses
    GET /api/faculties/{faculty_code}/
    """
    serializer_class = FacultyDetailSerializer
    lookup_field = 'code'
    lookup_url_kwarg = 'faculty_code'
    queryset = Faculty.objects.prefetch_related('courses')


# 📊 STATISTICS API
@api_view(['GET'])
def statistics_api(request):
    """
    API for dashboard statistics
    GET /api/statistics/
    
    Returns counts and other useful stats for your React dashboard
    """
    stats = {
        'total_faculties': Faculty.objects.count(),
        'total_courses': Course.objects.count(),
        'total_notes': Note.objects.count(),
        'current_academic_years': AcademicYear.objects.filter(is_current=True).count(),
        'notes_by_type': {},
        'recent_uploads': []
    }
    
    # Notes by type
    for note_type, _ in Note.NOTE_TYPES:
        count = Note.objects.filter(note_type=note_type).count()
        stats['notes_by_type'][note_type] = count
    
    # Recent uploads (last 10)
    recent_notes = Note.objects.select_related(
        'semester__year_level__academic_year__course'
    ).order_by('-uploaded_at')[:10]
    
    stats['recent_uploads'] = [
        {
            'id': note.id,
            'title': note.title,
            'course': note.semester.year_level.academic_year.course.code,
            'uploaded_at': note.uploaded_at
        }
        for note in recent_notes
    ]
    
    return Response(stats)


# 🗑️ NOTE DELETE API
class NoteDeleteAPIView(generics.DestroyAPIView):
    """
    Delete a note
    DELETE /api/notes/{note_id}/
    """
    queryset = Note.objects.all()
    lookup_url_kwarg = 'note_id'
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Delete the file from storage
        if instance.file:
            instance.file.delete()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)