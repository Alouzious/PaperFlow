# views.py - Enhanced with Preview and Payment System
from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Q, Prefetch
from django.utils import timezone
from decimal import Decimal

from .models import (
    Student, SiteSettings, AboutUs, HowItWorks, Faculty, Course, 
    AcademicYear, YearLevel, Semester, Note, Payment, StudentAccess
)
from .serializers import (
    StudentSerializer, SiteSettingsSerializer, AboutUsSerializer, 
    HowItWorksSerializer, FacultyListSerializer, FacultyDetailSerializer, 
    CourseDetailSerializer, DashboardSerializer, YearLevelWithCoursesSerializer, 
    NoteSerializer, NoteUploadSerializer, SearchResultSerializer, 
    YearLevelSerializer, SemesterSerializer, NoteWithAccessSerializer,
    PaymentSerializer, StudentAccessSerializer
)


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


# 🏠 DASHBOARD API
class DashboardAPIView(generics.ListAPIView):
    queryset = Faculty.objects.prefetch_related('courses').all()
    serializer_class = DashboardSerializer


# 🧭 COURSE DETAIL API
class CourseDetailAPIView(generics.RetrieveAPIView):
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
    faculty = get_object_or_404(Faculty, code__iexact=faculty_code)
    courses = faculty.courses.all()
    
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


# 📦 YEAR LEVEL NOTES API - FIXED SEMESTER ISSUE
@api_view(['GET'])
def year_level_notes_api(request, faculty_code, course_code, year, level):
    """
    FIXED: Get all notes for a specific year level with correct semester separation
    """
    faculty = get_object_or_404(Faculty, code__iexact=faculty_code)
    course = get_object_or_404(Course, faculty=faculty, code__iexact=course_code)
    academic_year = get_object_or_404(AcademicYear, course=course, year=year)
    year_level = get_object_or_404(YearLevel, academic_year=academic_year, level=level)
    
    # Get current student if logged in (for access control)
    student_id = request.query_params.get('student_id')
    student = None
    if student_id:
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            pass
    
    # Get semesters with their specific notes - FIXED THE BUG HERE
    semesters = year_level.semesters.prefetch_related('notes').order_by('semester_number')
    
    semester_data = []
    for semester in semesters:
        # Get notes specifically for THIS semester only
        semester_notes = semester.notes.all().order_by('-uploaded_at')
        
        notes_with_access = []
        for note in semester_notes:
            note_data = {
                'id': note.id,
                'title': note.title,
                'description': note.description,
                'note_type': note.note_type,
                'uploaded_at': note.uploaded_at,
                'file_size': note.file_size,
                'file_size_mb': note.file_size_mb,
                'file_extension': note.file_extension,
                'has_preview': note.has_preview,
                'view_count': note.view_count,
                
                # Access control info
                'can_preview': True,  # Always allow preview in free trial
                'can_view': True,     # Free trial - all access
                'can_download': False, # Downloads disabled in free trial
                'is_premium': note.is_premium,
                
                # URLs
                'preview_url': request.build_absolute_uri(f'/api/notes/{note.id}/preview/') if note.has_preview else None,
                'view_url': request.build_absolute_uri(f'/api/notes/{note.id}/view/'),
                'file_url': None,  # Disabled for free trial
            }
            
            # COMMENTED OUT - Payment system for future use
            """
            if student:
                # Check student's access for this note
                view_access = StudentAccess.objects.filter(
                    student=student, 
                    note=note, 
                    access_type='view',
                    is_active=True
                ).first()
                
                download_access = StudentAccess.objects.filter(
                    student=student, 
                    note=note, 
                    access_type='download',
                    is_active=True
                ).first()
                
                note_data['can_view'] = bool(view_access and view_access.has_valid_access())
                note_data['can_download'] = bool(download_access and download_access.has_valid_access())
                
                if note_data['can_download']:
                    note_data['file_url'] = request.build_absolute_uri(note.file.url)
            """
            
            notes_with_access.append(note_data)
        
        semester_data.append({
            'semester': {
                'id': semester.id,
                'semester_number': semester.semester_number,
                'name': semester.name
            },
            'notes': notes_with_access
        })
    
    response_data = {
        'faculty': {'name': faculty.name, 'code': faculty.code},
        'course': {'name': course.name, 'code': course.code},
        'academic_year': academic_year.year,
        'year_level': {
            'id': year_level.id,
            'level': year_level.level,
            'name': year_level.name,
            'semesters': semester_data
        }
    }
    
    return Response(response_data)


# 👀 PREVIEW API
@api_view(['GET'])
def note_preview_api(request, note_id):
    """
    Get preview of a note (first page + sample question)
    Always free during trial period
    """
    note = get_object_or_404(Note, id=note_id)
    
    if not note.has_preview:
        return Response({
            'error': 'Preview not available for this document'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # In free trial, always allow preview
    # COMMENTED OUT - Future payment logic
    """
    student_id = request.query_params.get('student_id')
    if student_id and note.is_premium:
        student = get_object_or_404(Student, id=student_id)
        # Check if student has preview access (free) or paid access
        access = StudentAccess.objects.filter(
            student=student,
            note=note,
            access_type__in=['preview', 'view', 'download'],
            is_active=True
        ).first()
        
        if not access or not access.has_valid_access():
            return Response({
                'error': 'Preview access required',
                'payment_required': True,
                'preview_price': 0,  # Preview is always free
                'view_price': SiteSettings.objects.first().view_price if SiteSettings.objects.exists() else 500
            }, status=status.HTTP_402_PAYMENT_REQUIRED)
    """
    
    # Track preview view
    note.view_count += 1
    note.save(update_fields=['view_count'])
    
    return Response({
        'id': note.id,
        'title': note.title,
        'description': note.description,
        'preview_available': True,
        'preview_url': request.build_absolute_uri(note.preview_file.url) if note.preview_file else None,
        'full_access_required': note.is_premium,
        'note_type': note.note_type,
        'semester': {
            'id': note.semester.id,
            'name': note.semester.name,
            'semester_number': note.semester.semester_number
        }
    })


# 📖 VIEW FULL DOCUMENT API
@api_view(['GET'])
def note_view_api(request, note_id):
    """
    View full document - Free during trial period
    """
    note = get_object_or_404(Note, id=note_id)
    student_id = request.query_params.get('student_id')
    
    # COMMENTED OUT - Future payment logic
    """
    if note.is_premium and student_id:
        student = get_object_or_404(Student, id=student_id)
        
        # Check if student has paid for view access
        view_access = StudentAccess.objects.filter(
            student=student,
            note=note,
            access_type__in=['view', 'download'],
            is_active=True
        ).first()
        
        if not view_access or not view_access.has_valid_access():
            site_settings = SiteSettings.objects.first()
            return Response({
                'error': 'Payment required to view full document',
                'payment_required': True,
                'view_price': site_settings.view_price if site_settings else 500,
                'download_price': site_settings.download_price if site_settings else 1000,
                'payment_methods': ['mtn', 'airtel']
            }, status=status.HTTP_402_PAYMENT_REQUIRED)
        
        # Update access tracking
        view_access.last_accessed = timezone.now()
        view_access.access_count += 1
        view_access.save()
    """
    
    # Track view
    note.view_count += 1
    note.save(update_fields=['view_count'])
    
    # During free trial, provide access to view the document
    return Response({
        'id': note.id,
        'title': note.title,
        'description': note.description,
        'file_url': request.build_absolute_uri(note.file.url),
        'file_size_mb': note.file_size_mb,
        'file_extension': note.file_extension,
        'note_type': note.note_type,
        'can_download': False,  # Downloads disabled during trial
        'message': 'Free trial access - downloads will be available after launch'
    })


# 📥 DOWNLOAD API (Disabled during trial)
@api_view(['GET'])
def note_download_api(request, note_id):
    """
    Download document - Disabled during free trial
    """
    note = get_object_or_404(Note, id=note_id)
    
    # DISABLED FOR FREE TRIAL
    return Response({
        'error': 'Downloads are currently disabled during free trial period',
        'message': 'Download functionality will be available after official launch',
        'note_title': note.title,
        'coming_soon': True
    }, status=status.HTTP_423_LOCKED)
    
    # COMMENTED OUT - Future download logic
    """
    student_id = request.query_params.get('student_id')
    
    if note.is_premium and student_id:
        student = get_object_or_404(Student, id=student_id)
        
        # Check if student has paid for download access
        download_access = StudentAccess.objects.filter(
            student=student,
            note=note,
            access_type='download',
            is_active=True
        ).first()
        
        if not download_access or not download_access.has_valid_access():
            site_settings = SiteSettings.objects.first()
            return Response({
                'error': 'Payment required to download document',
                'payment_required': True,
                'download_price': site_settings.download_price if site_settings else 1000,
                'payment_methods': ['mtn', 'airtel']
            }, status=status.HTTP_402_PAYMENT_REQUIRED)
        
        # Update access tracking
        download_access.last_accessed = timezone.now()
        download_access.access_count += 1
        download_access.save()
    
    # Track download
    note.download_count += 1
    note.save(update_fields=['download_count'])
    
    # Return file for download
    from django.http import FileResponse
    response = FileResponse(
        note.file.open('rb'),
        as_attachment=True,
        filename=f"{note.title}.{note.file_extension}"
    )
    return response
    """


# 💳 PAYMENT APIS (Commented out for future use)
"""
@api_view(['POST'])
def initiate_payment_api(request):
    '''
    Initiate payment for note access
    POST /api/payments/initiate/
    
    Body:
    {
        "student_id": 1,
        "note_id": 1,
        "payment_type": "view",  # or "download"
        "payment_method": "mtn",  # or "airtel"
        "phone_number": "+256700000000"
    }
    '''
    try:
        student = get_object_or_404(Student, id=request.data.get('student_id'))
        note = get_object_or_404(Note, id=request.data.get('note_id'))
        payment_type = request.data.get('payment_type')
        payment_method = request.data.get('payment_method')
        phone_number = request.data.get('phone_number')
        
        if not all([student, note, payment_type, payment_method, phone_number]):
            return Response({
                'error': 'Missing required fields'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already paid
        existing_access = StudentAccess.objects.filter(
            student=student,
            note=note,
            access_type=payment_type,
            is_active=True
        ).first()
        
        if existing_access and existing_access.has_valid_access():
            return Response({
                'error': 'You already have access to this content'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get pricing
        site_settings = SiteSettings.objects.first()
        if payment_type == 'view':
            amount = site_settings.view_price if site_settings else Decimal('500.00')
        else:  # download
            amount = site_settings.download_price if site_settings else Decimal('1000.00')
        
        # Create payment record
        payment = Payment.objects.create(
            student=student,
            note=note,
            payment_type=payment_type,
            amount=amount,
            payment_method=payment_method,
            phone_number=phone_number,
            status='pending'
        )
        
        # TODO: Integrate with MTN/Airtel APIs
        # For now, simulate payment processing
        
        # Simulate payment request to mobile money API
        if payment_method == 'mtn':
            # MTN Mobile Money API integration
            transaction_ref = f"MTN_{payment.id}_{timezone.now().timestamp()}"
        else:  # airtel
            # Airtel Money API integration
            transaction_ref = f"AIRTEL_{payment.id}_{timezone.now().timestamp()}"
        
        payment.external_ref = transaction_ref
        payment.save()
        
        return Response({
            'payment_id': payment.id,
            'transaction_ref': transaction_ref,
            'amount': amount,
            'status': 'pending',
            'message': f'Payment request sent to {phone_number}. Please check your phone and enter PIN to complete payment.'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def verify_payment_api(request, payment_id):
    '''
    Verify payment status and grant access
    POST /api/payments/{payment_id}/verify/
    '''
    try:
        payment = get_object_or_404(Payment, id=payment_id)
        
        # TODO: Verify payment with mobile money provider
        # For demo, we'll simulate successful payment
        
        if payment.status == 'completed':
            return Response({
                'status': 'already_completed',
                'message': 'Payment already verified'
            })
        
        # Simulate payment verification
        payment.status = 'completed'
        payment.completed_at = timezone.now()
        payment.transaction_id = f"TXN_{payment.id}_{timezone.now().timestamp()}"
        payment.save()
        
        # Grant access
        StudentAccess.objects.get_or_create(
            student=payment.student,
            note=payment.note,
            access_type=payment.payment_type,
            defaults={'is_active': True}
        )
        
        # Update student's spending
        payment.student.total_spent += payment.amount
        payment.student.save()
        
        return Response({
            'status': 'completed',
            'message': f'{payment.payment_type.title()} access granted successfully!',
            'access_granted': True,
            'amount_paid': payment.amount
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def payment_status_api(request, payment_id):
    '''
    Check payment status
    GET /api/payments/{payment_id}/status/
    '''
    payment = get_object_or_404(Payment, id=payment_id)
    
    return Response({
        'payment_id': payment.id,
        'status': payment.status,
        'amount': payment.amount,
        'payment_type': payment.payment_type,
        'created_at': payment.created_at,
        'completed_at': payment.completed_at,
        'transaction_id': payment.transaction_id
    })
"""


# 🔍 SEARCH API
class SearchNotesAPIView(generics.ListAPIView):
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
        
        return queryset.order_by('-uploaded_at')[:100]


# 📤 FILE UPLOAD API
class NoteUploadAPIView(generics.CreateAPIView):
    serializer_class = NoteUploadSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note = serializer.save()
        
        response_serializer = SearchResultSerializer(note, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


# 📋 FACULTY LIST API
class FacultyListAPIView(generics.ListAPIView):
    queryset = Faculty.objects.all()
    serializer_class = FacultyListSerializer


# 🏫 FACULTY DETAIL API
class FacultyDetailAPIView(generics.RetrieveAPIView):
    serializer_class = FacultyDetailSerializer
    lookup_field = 'code'
    lookup_url_kwarg = 'faculty_code'
    queryset = Faculty.objects.prefetch_related('courses')


# 📊 STATISTICS API
@api_view(['GET'])
def statistics_api(request):
    stats = {
        'total_faculties': Faculty.objects.count(),
        'total_courses': Course.objects.count(),
        'total_notes': Note.objects.count(),
        'current_academic_years': AcademicYear.objects.filter(is_current=True).count(),
        'notes_by_type': {},
        'recent_uploads': [],
        'total_previews': Note.objects.filter(has_preview=True).count(),
        'premium_notes': Note.objects.filter(is_premium=True).count(),
        # COMMENTED OUT - Payment stats for future
        # 'total_payments': Payment.objects.filter(status='completed').count(),
        # 'total_revenue': Payment.objects.filter(status='completed').aggregate(total=models.Sum('amount'))['total'] or 0,
    }
    
    # Notes by type
    for note_type, _ in Note.NOTE_TYPES:
        count = Note.objects.filter(note_type=note_type).count()
        stats['notes_by_type'][note_type] = count
    
    # Recent uploads
    recent_notes = Note.objects.select_related(
        'semester__year_level__academic_year__course'
    ).order_by('-uploaded_at')[:10]
    
    stats['recent_uploads'] = [
        {
            'id': note.id,
            'title': note.title,
            'course': note.semester.year_level.academic_year.course.code,
            'uploaded_at': note.uploaded_at,
            'has_preview': note.has_preview
        }
        for note in recent_notes
    ]
    
    return Response(stats)


# 🗑️ NOTE DELETE API
class NoteDeleteAPIView(generics.DestroyAPIView):
    queryset = Note.objects.all()
    lookup_url_kwarg = 'note_id'
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Delete the file from storage
        if instance.file:
            instance.file.delete()
        if instance.preview_file:
            instance.preview_file.delete()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


# 👤 STUDENT DASHBOARD API
@api_view(['GET'])
def student_dashboard_api(request, student_id):
    """
    Get student's personal dashboard with access history
    """
    student = get_object_or_404(Student, id=student_id)
    
    # COMMENTED OUT - Payment history for future
    """
    # Get student's access records
    access_records = StudentAccess.objects.filter(
        student=student,
        is_active=True
    ).select_related('note__semester__year_level__academic_year__course').order_by('-granted_at')[:10]
    
    # Get payment history
    payments = Payment.objects.filter(
        student=student,
        status='completed'
    ).order_by('-completed_at')[:10]
    """
    
    # Get recently viewed notes (during free trial)
    # This would be based on actual view tracking in production
    recent_views = []
    
    return Response({
        'student': {
            'id': student.id,
            'full_name': student.full_name,
            'email': student.email,
            'course': student.course,
            'year': student.year,
            'total_spent': student.total_spent,
        },
        'recent_views': recent_views,
        'access_summary': {
            'total_accessed_notes': 0,  # Would be calculated from access records
            'favorite_subjects': [],
            'most_accessed_type': 'lecture'
        },
        'trial_status': {
            'is_trial': True,
            'message': 'Currently in free trial period - all content viewable, downloads coming soon!'
        }
        # COMMENTED OUT - Payment info for future
        # 'access_records': [
        #     {
        #         'note_title': access.note.title,
        #         'access_type': access.access_type,
        #         'granted_at': access.granted_at,
        #         'last_accessed': access.last_accessed,
        #         'course': access.note.semester.year_level.academic_year.course.code
        #     } for access in access_records
        # ],
        # 'payment_history': [
        #     {
        #         'amount': payment.amount,
        #         'payment_type': payment.payment_type,
        #         'note_title': payment.note.title,
        #         'completed_at': payment.completed_at
        #     } for payment in payments
        # ]
    })