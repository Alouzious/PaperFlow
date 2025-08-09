from rest_framework import serializers
from .models import Student, SiteSettings, AboutUs, HowItWorks

class SiteSettingsSerializer(serializers.ModelSerializer):
    site_logo = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = [
            'site_name',
            'site_logo',
            'welcomemsg',
            'backgroundimage',
            'backgroundimage2',
            'contact_email',
            'instagram_url',
            'twitter_url',
            'linkedin_url',
            'telegram_url',
            'whatsapp_number',
            'facebook_url',
        ]

    def get_site_logo(self, obj):
        request = self.context.get('request')
        if obj.site_logo and request:
            return request.build_absolute_uri(obj.site_logo.url)
        elif obj.site_logo:
            return obj.site_logo.url
        return None


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__' 




class AboutUsSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    team_members_list = serializers.SerializerMethodField()

    class Meta:
        model = AboutUs
        fields = [
            'title',
            'subtitle',
            'description',
            'mission',
            'vision',
            'history',
            'image',
            'team_members',
            'team_members_list',
            'website', 
            'updated_at',
        ]

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            return obj.image.url
        return None

    def get_team_members_list(self, obj):
        if obj.team_members:
            # Return list by splitting on commas and stripping spaces
            return [name.strip() for name in obj.team_members.split(',')]
        return []


class HowItWorksSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = HowItWorks
        fields = [
            'step_number',
            'step_title',
            'description',
            'image',
            'created_at',
            'updated_at',
        ]

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            return obj.image.url
        return None





# serializers.py
from rest_framework import serializers
from .models import Faculty, Course, AcademicYear, YearLevel, Semester, Note


class NoteSerializer(serializers.ModelSerializer):
    """Serializer for individual notes/files"""
    file_size_mb = serializers.ReadOnlyField()
    file_extension = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Note
        fields = [
            'id', 'title', 'description', 'file', 'file_url', 'note_type', 
            'uploaded_at', 'file_size', 'file_size_mb', 'file_extension'
        ]
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None


class SemesterSerializer(serializers.ModelSerializer):
    """Serializer for semesters with their notes"""
    notes = NoteSerializer(many=True, read_only=True)
    notes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Semester
        fields = ['id', 'semester_number', 'name', 'notes', 'notes_count']
    
    def get_notes_count(self, obj):
        return obj.notes.count()


class YearLevelSerializer(serializers.ModelSerializer):
    """Serializer for year levels with semesters"""
    semesters = SemesterSerializer(many=True, read_only=True)
    
    class Meta:
        model = YearLevel
        fields = ['id', 'level', 'name', 'semesters']


class AcademicYearSerializer(serializers.ModelSerializer):
    """Serializer for academic years with year levels"""
    year_levels = YearLevelSerializer(many=True, read_only=True)
    
    class Meta:
        model = AcademicYear
        fields = ['id', 'year', 'is_current', 'year_levels']


class CourseDetailSerializer(serializers.ModelSerializer):
    """Detailed course serializer with all academic years and content"""
    academic_years = AcademicYearSerializer(many=True, read_only=True)
    course_type_display = serializers.CharField(source='get_course_type_display', read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'course_type', 'course_type_display', 
            'duration_years', 'academic_years'
        ]


class CourseListSerializer(serializers.ModelSerializer):
    """Simple course serializer for lists (without academic years)"""
    course_type_display = serializers.CharField(source='get_course_type_display', read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'course_type', 'course_type_display', 'duration_years']


class FacultyDetailSerializer(serializers.ModelSerializer):
    """Detailed faculty serializer with courses"""
    courses = CourseListSerializer(many=True, read_only=True)
    courses_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Faculty
        fields = ['id', 'name', 'code', 'description', 'courses', 'courses_count']
    
    def get_courses_count(self, obj):
        return obj.courses.count()


class FacultyListSerializer(serializers.ModelSerializer):
    """Simple faculty serializer for dashboard"""
    courses = CourseListSerializer(many=True, read_only=True)
    
    class Meta:
        model = Faculty
        fields = ['id', 'name', 'code', 'courses']


# Specialized serializers for specific API endpoints

class DashboardSerializer(serializers.ModelSerializer):
    """
    Special serializer for dashboard - gives exactly what React needs
    for the faculty cards with courses in 2-column layout
    """
    courses = serializers.SerializerMethodField()
    
    class Meta:
        model = Faculty
        fields = ['id', 'name', 'code', 'description', 'courses']
    
    def get_courses(self, obj):
        courses = obj.courses.all()
        # Group courses into pairs for 2-column display
        courses_data = CourseListSerializer(courses, many=True).data
        # Return courses grouped in pairs: [[course1, course2], [course3, course4], ...]
        course_pairs = [courses_data[i:i+2] for i in range(0, len(courses_data), 2)]
        return {
            'all': courses_data,
            'pairs': course_pairs
        }


class YearLevelWithCoursesSerializer(serializers.ModelSerializer):
    """
    For the hover effect - shows year levels for each course in a specific academic year
    """
    year_levels = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'year_levels']
    
    def get_year_levels(self, obj):
        year = self.context.get('year')
        if year:
            try:
                academic_year = obj.academic_years.get(year=year)
                return [
                    {
                        'id': yl.id,
                        'level': yl.level,
                        'name': yl.name
                    }
                    for yl in academic_year.year_levels.all()
                ]
            except AcademicYear.DoesNotExist:
                pass
        return []


class FacultyCoursesYearSerializer(serializers.Serializer):
    """
    For the faculty page API - shows all courses with their year levels for a specific year
    Used for the hover functionality you described
    """
    faculty_name = serializers.CharField()
    faculty_code = serializers.CharField()
    year = serializers.IntegerField()
    courses = YearLevelWithCoursesSerializer(many=True)


class NoteUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading new notes"""
    class Meta:
        model = Note
        fields = ['title', 'description', 'file', 'note_type', 'semester']
    
    def validate_file(self, value):
        # Add file validation (size, type, etc.)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError("File too large. Maximum size is 10MB.")
        
        allowed_extensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.jpg', '.png']
        file_extension = value.name.split('.')[-1].lower()
        if f'.{file_extension}' not in allowed_extensions:
            raise serializers.ValidationError(
                f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        return value


class SearchResultSerializer(serializers.ModelSerializer):
    """Serializer for search results with context information"""
    faculty_name = serializers.CharField(source='semester.year_level.academic_year.course.faculty.name', read_only=True)
    faculty_code = serializers.CharField(source='semester.year_level.academic_year.course.faculty.code', read_only=True)
    course_name = serializers.CharField(source='semester.year_level.academic_year.course.name', read_only=True)
    course_code = serializers.CharField(source='semester.year_level.academic_year.course.code', read_only=True)
    academic_year = serializers.IntegerField(source='semester.year_level.academic_year.year', read_only=True)
    year_level_name = serializers.CharField(source='semester.year_level.name', read_only=True)
    semester_name = serializers.CharField(source='semester.name', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_size_mb = serializers.ReadOnlyField()
    
    class Meta:
        model = Note
        fields = [
            'id', 'title', 'description', 'note_type', 'uploaded_at',
            'file_url', 'file_size_mb', 'faculty_name', 'faculty_code',
            'course_name', 'course_code', 'academic_year', 'year_level_name',
            'semester_name'
        ]
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None