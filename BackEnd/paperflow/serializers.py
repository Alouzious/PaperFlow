# serializers.py - Enhanced with Preview and Payment System
from rest_framework import serializers
from .models import (
    Student, SiteSettings, AboutUs, HowItWorks, Faculty, Course,
    AcademicYear, YearLevel, Semester, Note, Payment, StudentAccess
)


class SiteSettingsSerializer(serializers.ModelSerializer):
    site_logo = serializers.SerializerMethodField()
    backgroundimage = serializers.SerializerMethodField()
    backgroundimage2 = serializers.SerializerMethodField()
    
    class Meta:
        model = SiteSettings
        fields = [
            'id', 'site_name', 'site_logo', 'welcomemsg', 'backgroundimage', 
            'backgroundimage2', 'contact_email', 'instagram_url', 'twitter_url',
            'linkedin_url', 'telegram_url', 'whatsapp_number', 'facebook_url',
            'view_price', 'download_price', 'enable_payments', 'created_at', 'updated_at'
        ]
    
    def get_site_logo(self, obj):
        if obj.site_logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.site_logo.url)
        return None
    
    def get_backgroundimage(self, obj):
        if obj.backgroundimage:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.backgroundimage.url)
        return None
    
    def get_backgroundimage2(self, obj):
        if obj.backgroundimage2:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.backgroundimage2.url)
        return None


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'id', 'full_name', 'email', 'course', 'year', 'is_logged_in',
            'login_token', 'total_spent', 'created_at'
        ]
        read_only_fields = ['login_token', 'total_spent', 'created_at']


class AboutUsSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    team_members_list = serializers.SerializerMethodField()
    
    class Meta:
        model = AboutUs
        fields = [
            'id', 'title', 'subtitle', 'description', 'mission', 'vision',
            'history', 'image', 'team_members', 'team_members_list', 'website',
            'created_at', 'updated_at'
        ]
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None
    
    def get_team_members_list(self, obj):
        if obj.team_members:
            return [name.strip() for name in obj.team_members.split(',') if name.strip()]
        return []


class HowItWorksSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = HowItWorks
        fields = [
            'id', 'step_number', 'step_title', 'description', 'image',
            'created_at', 'updated_at'
        ]
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None


class FacultyListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = ['id', 'name', 'code', 'description', 'created_at']


class FacultyDetailSerializer(serializers.ModelSerializer):
    courses = serializers.SerializerMethodField()
    
    class Meta:
        model = Faculty
        fields = ['id', 'name', 'code', 'description', 'created_at', 'courses']
    
    def get_courses(self, obj):
        courses = obj.courses.all()
        return [
            {
                'id': course.id,
                'name': course.name,
                'code': course.code,
                'course_type': course.course_type,
                'duration_years': course.duration_years
            }
            for course in courses
        ]


# Enhanced Note Serializer with Preview and Access Control
class NoteWithAccessSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.ReadOnlyField()
    file_extension = serializers.ReadOnlyField()
    preview_url = serializers.SerializerMethodField()
    view_url = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()
    
    # Access control fields
    can_preview = serializers.SerializerMethodField()
    can_view = serializers.SerializerMethodField()
    can_download = serializers.SerializerMethodField()
    access_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Note
        fields = [
            'id', 'title', 'description', 'note_type', 'uploaded_at',
            'file_size', 'file_size_mb', 'file_extension', 'has_preview',
            'preview_generated_at', 'is_premium', 'view_count', 'download_count',
            'preview_url', 'view_url', 'download_url',
            'can_preview', 'can_view', 'can_download', 'access_info'
        ]
    
    def get_preview_url(self, obj):
        if obj.has_preview:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(f'/api/notes/{obj.id}/preview/')
        return None
    
    def get_view_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/notes/{obj.id}/view/')
        return None
    
    def get_download_url(self, obj):
        # Downloads disabled during free trial
        return None
        # COMMENTED OUT - Future download functionality
        """
        request = self.context.get('request')
        student = self.context.get('student')
        
        if request and student:
            # Check if student has download access
            download_access = StudentAccess.objects.filter(
                student=student,
                note=obj,
                access_type='download',
                is_active=True
            ).first()
            
            if download_access and download_access.has_valid_access():
                return request.build_absolute_uri(f'/api/notes/{obj.id}/download/')
        return None
        """
    
    def get_can_preview(self, obj):
        # Always allow preview during free trial
        return True
    
    def get_can_view(self, obj):
        # Always allow view during free trial
        return True
        # COMMENTED OUT - Future access control
        """
        student = self.context.get('student')
        if not obj.is_premium:
            return True
            
        if student:
            view_access = StudentAccess.objects.filter(
                student=student,
                note=obj,
                access_type__in=['view', 'download'],
                is_active=True
            ).first()
            return bool(view_access and view_access.has_valid_access())
        return False
        """
    
    def get_can_download(self, obj):
        # Downloads disabled during free trial
        return False
        # COMMENTED OUT - Future download access
        """
        student = self.context.get('student')
        if student:
            download_access = StudentAccess.objects.filter(
                student=student,
                note=obj,
                access_type='download',
                is_active=True
            ).first()
            return bool(download_access and download_access.has_valid_access())
        return False
        """
    
    def get_access_info(self, obj):
        site_settings = SiteSettings.objects.first()
        
        return {
            'is_free_trial': True,
            'trial_message': 'Currently in free trial - all content viewable, downloads coming soon!',
            'view_price': float(site_settings.view_price) if site_settings else 500.0,
            'download_price': float(site_settings.download_price) if site_settings else 1000.0,
            'payments_enabled': site_settings.enable_payments if site_settings else False
        }


class SemesterWithNotesSerializer(serializers.ModelSerializer):
    notes = NoteWithAccessSerializer(many=True, read_only=True)
    
    class Meta:
        model = Semester
        fields = ['id', 'semester_number', 'name', 'notes']


class YearLevelWithSemestersSerializer(serializers.ModelSerializer):
    semesters = SemesterWithNotesSerializer(many=True, read_only=True)
    
    class Meta:
        model = YearLevel
        fields = ['id', 'level', 'name', 'semesters']


class AcademicYearSerializer(serializers.ModelSerializer):
    year_levels = YearLevelWithSemestersSerializer(many=True, read_only=True)
    
    class Meta:
        model = AcademicYear
        fields = ['id', 'year', 'is_current', 'year_levels']


class CourseDetailSerializer(serializers.ModelSerializer):
    academic_years = AcademicYearSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'course_type', 'duration_years',
            'created_at', 'academic_years'
        ]


class YearLevelWithCoursesSerializer(serializers.ModelSerializer):
    year_levels = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'year_levels']
    
    def get_year_levels(self, obj):
        year = self.context.get('year')
        if not year:
            return []
        
        try:
            academic_year = obj.academic_years.get(year=year)
            year_levels = academic_year.year_levels.all()
            return [
                {
                    'id': yl.id,
                    'level': yl.level,
                    'name': yl.name
                }
                for yl in year_levels
            ]
        except AcademicYear.DoesNotExist:
            return []


class DashboardSerializer(serializers.ModelSerializer):
    courses = serializers.SerializerMethodField()
    
    class Meta:
        model = Faculty
        fields = ['id', 'name', 'code', 'description', 'courses']
    
    def get_courses(self, obj):
        courses = obj.courses.all()
        course_data = []
        
        for course in courses:
            course_data.append({
                'id': course.id,
                'name': course.name,
                'code': course.code,
                'course_type': course.course_type,
                'duration_years': course.duration_years
            })
        
        # Group courses in pairs for UI layout
        pairs = []
        for i in range(0, len(course_data), 2):
            pair = course_data[i:i+2]
            pairs.append(pair)
        
        return {
            'all': course_data,
            'pairs': pairs
        }


class NoteSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.ReadOnlyField()
    file_extension = serializers.ReadOnlyField()
    semester_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Note
        fields = [
            'id', 'title', 'description', 'note_type', 'uploaded_at',
            'file_size', 'file_size_mb', 'file_extension', 'has_preview',
            'is_premium', 'view_count', 'download_count', 'semester_info'
        ]
    
    def get_semester_info(self, obj):
        return {
            'id': obj.semester.id,
            'name': obj.semester.name,
            'semester_number': obj.semester.semester_number,
            'year_level': obj.semester.year_level.name,
            'course': obj.semester.year_level.academic_year.course.code,
            'academic_year': obj.semester.year_level.academic_year.year
        }


class SemesterSerializer(serializers.ModelSerializer):
    notes = NoteSerializer(many=True, read_only=True)
    notes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Semester
        fields = ['id', 'semester_number', 'name', 'notes', 'notes_count']
    
    def get_notes_count(self, obj):
        return obj.notes.count()


class YearLevelSerializer(serializers.ModelSerializer):
    semesters = SemesterSerializer(many=True, read_only=True)
    
    class Meta:
        model = YearLevel
        fields = ['id', 'level', 'name', 'semesters']


class SearchResultSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.ReadOnlyField()
    file_extension = serializers.ReadOnlyField()
    course_info = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()
    view_url = serializers.SerializerMethodField()
    access_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Note
        fields = [
            'id', 'title', 'description', 'note_type', 'uploaded_at',
            'file_size', 'file_size_mb', 'file_extension', 'has_preview',
            'is_premium', 'view_count', 'course_info', 'preview_url',
            'view_url', 'access_info'
        ]
    
    def get_course_info(self, obj):
        return {
            'faculty_name': obj.semester.year_level.academic_year.course.faculty.name,
            'faculty_code': obj.semester.year_level.academic_year.course.faculty.code,
            'course_name': obj.semester.year_level.academic_year.course.name,
            'course_code': obj.semester.year_level.academic_year.course.code,
            'academic_year': obj.semester.year_level.academic_year.year,
            'year_level': obj.semester.year_level.name,
            'semester': obj.semester.name,
            'semester_number': obj.semester.semester_number
        }
    
    def get_preview_url(self, obj):
        if obj.has_preview:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(f'/api/notes/{obj.id}/preview/')
        return None
    
    def get_view_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/notes/{obj.id}/view/')
        return None
    
    def get_access_info(self, obj):
        return {
            'can_preview': True,  # Always during trial
            'can_view': True,     # Always during trial
            'can_download': False, # Disabled during trial
            'is_trial': True,
            'trial_message': 'Free trial access - downloads coming soon!'
        }


class NoteUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = [
            'title', 'description', 'file', 'note_type', 'semester', 'is_premium'
        ]
    
    def validate_file(self, value):
        # Validate file size (max 50MB)
        max_size = 50 * 1024 * 1024  # 50MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File size cannot exceed 50MB. Current size: {value.size / (1024*1024):.2f}MB"
            )
        
        # Validate file type
        allowed_extensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt']
        file_extension = value.name.lower().split('.')[-1]
        if f'.{file_extension}' not in allowed_extensions:
            raise serializers.ValidationError(
                f"File type .{file_extension} not allowed. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        return value


# Payment System Serializers (for future use)
class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    note_title = serializers.CharField(source='note.title', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'student', 'student_name', 'note', 'note_title',
            'payment_type', 'amount', 'payment_method', 'phone_number',
            'transaction_id', 'external_ref', 'status', 'created_at', 'completed_at'
        ]
        read_only_fields = ['transaction_id', 'external_ref', 'completed_at']


class StudentAccessSerializer(serializers.ModelSerializer):
    note_title = serializers.CharField(source='note.title', read_only=True)
    note_type = serializers.CharField(source='note.note_type', read_only=True)
    course_info = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentAccess
        fields = [
            'id', 'note', 'note_title', 'note_type', 'access_type',
            'granted_at', 'expires_at', 'is_active', 'last_accessed',
            'access_count', 'course_info'
        ]
    
    def get_course_info(self, obj):
        return {
            'course_code': obj.note.semester.year_level.academic_year.course.code,
            'course_name': obj.note.semester.year_level.academic_year.course.name,
            'semester': obj.note.semester.name,
            'year_level': obj.note.semester.year_level.name
        }


class StudentDashboardSerializer(serializers.ModelSerializer):
    access_records = StudentAccessSerializer(many=True, read_only=True)
    payment_history = PaymentSerializer(source='payments', many=True, read_only=True)
    access_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = [
            'id', 'full_name', 'email', 'course', 'year', 'total_spent',
            'created_at', 'access_records', 'payment_history', 'access_summary'
        ]
    
    def get_access_summary(self, obj):
        # COMMENTED OUT - Future analytics
        """
        access_records = obj.access_records.filter(is_active=True)
        
        # Get favorite note types
        note_types = access_records.values_list('note__note_type', flat=True)
        from collections import Counter
        type_counts = Counter(note_types)
        
        return {
            'total_accessed_notes': access_records.count(),
            'favorite_note_types': dict(type_counts.most_common(3)),
            'total_views': sum(access_records.values_list('access_count', flat=True)),
            'most_recent_access': access_records.order_by('-last_accessed').first().last_accessed if access_records.exists() else None
        }
        """
        return {
            'total_accessed_notes': 0,
            'favorite_note_types': {},
            'total_views': 0,
            'most_recent_access': None,
            'trial_status': 'active'
        }