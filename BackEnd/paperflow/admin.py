from django.contrib import admin
from .models import Student, SiteSettings, AboutUs, HowItWorks
from django.utils.html import format_html
# Register your models here.

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('site_name', 'contact_email', 'logo_thumbnail', 'updated_at')
    readonly_fields = ('logo_preview', 'created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': ('site_name', 'site_logo', 'welcomemsg','logo_preview', 'backgroundimage', 'backgroundimage2')
        }),
        ('Contact Info', {
            'fields': ('contact_email', 'whatsapp_number')
        }),
        ('Social Media Links', {
            'fields': ('instagram_url', 'twitter_url', 'linkedin_url', 'telegram_url', 'facebook_url')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def logo_thumbnail(self, obj):
        if obj.site_logo:
            return format_html('<img src="{}" width="50" style="border-radius:4px;" />', obj.site_logo.url)
        return "No Logo"
    logo_thumbnail.short_description = 'Logo'

    def has_add_permission(self, request):
        # Limit to only one instance
        return not SiteSettings.objects.exists() or super().has_add_permission(request)



@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'course', 'year', 'is_logged_in')
    search_fields = ('full_name', 'email', 'course')



@admin.register(AboutUs)
class AboutUsAdmin(admin.ModelAdmin):
    list_display = ('title', 'website', 'updated_at', 'image_thumbnail')
    readonly_fields = ('image_preview', 'updated_at')

    fieldsets = (
        (None, {
            'fields': ('title', 'subtitle', 'description', 'mission', 'vision', 'history', 'team_members', 'website')
        }),
        ('Image', {
            'fields': ('image', 'image_preview')
        }),
        ('Timestamps', {
            'fields': ('updated_at',)
        }),
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="150" style="border-radius:5px;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Image Preview'

    def image_thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" style="border-radius:5px;" />', obj.image.url)
        return "No Image"
    image_thumbnail.short_description = 'Image'

    def has_add_permission(self, request):
        # Only one instance allowed (singleton pattern)
        if AboutUs.objects.exists():
            return False
        return super().has_add_permission(request)



@admin.register(HowItWorks)
class HowItWorksAdmin(admin.ModelAdmin):
    list_display = ('step_number', 'step_title', 'image_thumbnail')
    readonly_fields = ('image_preview', 'created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': ('step_number', 'step_title', 'description', 'image', 'image_preview')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')  # ✅ Now it's fine because they are read-only
        }),
    )

    def image_thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" style="border-radius:4px;" />', obj.image.url)
        return "No Image"
    image_thumbnail.short_description = "Image"

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="200" style="border-radius:6px;" />', obj.image.url)
        return "No Preview"
    image_preview.short_description = "Image Preview"


from django.contrib import admin
from .models import Faculty, Course, AcademicYear, YearLevel, Semester, Note

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'created_at')
    search_fields = ('name', 'code')
    ordering = ('name',)

class AcademicYearInline(admin.TabularInline):
    model = AcademicYear
    extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'faculty', 'course_type', 'duration_years', 'created_at')
    list_filter = ('faculty', 'course_type')
    search_fields = ('name', 'code', 'faculty__name')
    ordering = ('faculty', 'name')
    inlines = [AcademicYearInline]

class YearLevelInline(admin.TabularInline):
    model = YearLevel
    extra = 1

@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ('course', 'year', 'is_current', 'created_at')
    list_filter = ('course__faculty', 'year', 'is_current')
    search_fields = ('course__name', 'course__code', 'year')
    ordering = ('-year',)
    inlines = [YearLevelInline]

class SemesterInline(admin.TabularInline):
    model = Semester
    extra = 2

@admin.register(YearLevel)
class YearLevelAdmin(admin.ModelAdmin):
    list_display = ('academic_year', 'level', 'name')
    list_filter = ('academic_year__course__faculty', 'academic_year__year')
    search_fields = ('academic_year__course__name', 'name')
    ordering = ('academic_year', 'level')
    inlines = [SemesterInline]

class NoteInline(admin.TabularInline):
    model = Note
    extra = 1

@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ('year_level', 'semester_number', 'name')
    list_filter = ('year_level__academic_year__year', 'semester_number')
    search_fields = ('year_level__academic_year__course__name', 'name')
    ordering = ('year_level', 'semester_number')
    inlines = [NoteInline]

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'semester', 'note_type', 'uploaded_at', 'file_size_mb')
    list_filter = ('note_type', 'uploaded_at', 'semester__year_level__academic_year__year')
    search_fields = ('title', 'semester__year_level__academic_year__course__name')
    ordering = ('-uploaded_at',)
