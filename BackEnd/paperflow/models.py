# models.py - Enhanced with Preview and Payment System
from django.db import models
from django.core.exceptions import ValidationError
from PIL import Image
from django.utils import timezone
import uuid
import os
from decimal import Decimal


class SiteSettings(models.Model):
    site_name = models.CharField(max_length=100)
    site_logo = models.ImageField(upload_to='site_logos/')
    welcomemsg = models.CharField(max_length=1000, null=True, blank=True, help_text="Welcome To PaperFlow Site")
    backgroundimage = models.ImageField(upload_to='backgrounds/', blank=True, null=True, help_text="Optional background image for the site")
    backgroundimage2 = models.ImageField(upload_to='backgrounds/', blank=True, null=True, help_text="Optional background image for the site")
    contact_email = models.EmailField()

    instagram_url = models.URLField(blank=True, null=True)
    twitter_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    telegram_url = models.URLField(blank=True, null=True)
    whatsapp_number = models.CharField(max_length=20, help_text="Use full international format, e.g., +2567XXXXXXX")
    facebook_url = models.URLField(blank=True, null=True)

    # Payment settings (for future use)
    view_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('500.00'), help_text="Price to view full paper (UGX)")
    download_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('1000.00'), help_text="Price to download paper (UGX)")
    enable_payments = models.BooleanField(default=False, help_text="Enable payment system (currently disabled for free trial)")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if SiteSettings.objects.exists() and not self.pk:
            raise ValidationError("Only one SiteSettings instance is allowed.")

    def __str__(self):
        return self.site_name or "Site Settings"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.site_logo:
            img_path = self.site_logo.path
            with Image.open(img_path) as img:
                max_width = 300
                if img.width > max_width:
                    output_size = (max_width, int(img.height * (max_width / img.width)))
                    output_size = (800, 800)
                    img = img.resize(output_size, Image.Resampling.LANCZOS)
                    img.save(img_path)

    def logo_preview(self):
        if self.site_logo:
            return f'<img src="{self.site_logo.url}" width="100" style="border-radius:5px;" />'
        return "No logo uploaded"
    logo_preview.short_description = "Logo Preview"
    logo_preview.allow_tags = True


class Student(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    course = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    is_logged_in = models.BooleanField(default=False)
    login_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    
    # Track student's payment history (for future use)
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name


class AboutUs(models.Model):
    title = models.CharField(max_length=255, help_text="Main title or heading")
    subtitle = models.CharField(max_length=255, blank=True, null=True, help_text="Optional subheading or tagline")
    description = models.TextField(help_text="Full description about the organization")
    mission = models.TextField(blank=True, null=True)
    vision = models.TextField(blank=True, null=True)
    history = models.TextField(blank=True, null=True, help_text="Background or how it started")
    image = models.ImageField(upload_to='about/', blank=True, null=True, help_text="An optional image (e.g., team photo, logo, etc.)")
    team_members = models.TextField(blank=True, null=True, help_text="Enter names separated by commas. E.g. John, Sarah, Alex")
    website = models.URLField(blank=True, null=True, help_text="Link to the organization's website")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.image:
            img_path = self.image.path
            with Image.open(img_path) as img:
                max_width = 300
                if img.width > max_width:
                    ratio = max_width / float(img.width)
                    new_height = int(img.height * ratio)
                    output_size = (800, 800)
                    img = img.resize(output_size, Image.Resampling.LANCZOS)
                    img.save(img_path)

    def image_preview(self):
        if self.image:
            return f'<img src="{self.image.url}" width="150" style="border-radius:5px;" />'
        return "No Image"
    image_preview.short_description = "Image Preview"
    image_preview.allow_tags = True


class HowItWorks(models.Model):
    step_number = models.PositiveIntegerField(help_text="Order of this step in the process")
    step_title = models.CharField(max_length=255, help_text="Short title for this step")
    description = models.TextField(help_text="Detailed explanation of this step")
    image = models.ImageField(upload_to='how_it_works/', blank=True, null=True, help_text="Optional illustration for the step")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['step_number']
        verbose_name = "How It Works Step"
        verbose_name_plural = "How It Works Steps"

    def __str__(self):
        return f"Step {self.step_number}: {self.step_title}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.image:
            img_path = self.image.path
            with Image.open(img_path) as img:
                max_width = 300
                if img.width > max_width:
                    ratio = max_width / float(img.width)
                    new_height = int(float(img.height) * ratio)
                    output_size = (800, 800)
                    img = img.resize(output_size, Image.Resampling.LANCZOS)
                    img.save(img_path)

    def image_preview(self):
        if self.image:
            return f'<img src="{self.image.url}" width="150" style="border-radius: 5px;" />'
        return "No Image"
    image_preview.short_description = "Image Preview"
    image_preview.allow_tags = True


class Faculty(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Faculties"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class Course(models.Model):
    COURSE_TYPES = [
        ('bachelor', "Bachelor's Degree"),
        ('diploma', 'Diploma'),
        ('certificate', 'Certificate'),
    ]
    
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='courses')
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=10)
    course_type = models.CharField(max_length=20, choices=COURSE_TYPES)
    duration_years = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['faculty', 'code']
        ordering = ['name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class AcademicYear(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='academic_years')
    year = models.PositiveIntegerField()
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['course', 'year']
        ordering = ['-year']
    
    def __str__(self):
        return f"{self.course.code} - {self.year}"
    
    def save(self, *args, **kwargs):
        if self.is_current:
            AcademicYear.objects.filter(course=self.course, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)
        self.cleanup_old_years()
    
    def cleanup_old_years(self):
        years_to_keep = AcademicYear.objects.filter(course=self.course).order_by('-year')[:2]
        years_to_delete = AcademicYear.objects.filter(course=self.course).exclude(
            id__in=[year.id for year in years_to_keep]
        )
        years_to_delete.delete()


class YearLevel(models.Model):
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='year_levels')
    level = models.PositiveIntegerField()
    name = models.CharField(max_length=50)
    
    class Meta:
        unique_together = ['academic_year', 'level']
        ordering = ['level']
    
    def __str__(self):
        return f"{self.academic_year.course.code} {self.academic_year.year} - {self.name}"
    
    def clean(self):
        if self.level > self.academic_year.course.duration_years:
            raise ValidationError(
                f"Year {self.level} exceeds course duration of {self.academic_year.course.duration_years} years"
            )


class Semester(models.Model):
    SEMESTER_CHOICES = [
        (1, 'Semester 1'),
        (2, 'Semester 2'),
    ]
    
    year_level = models.ForeignKey(YearLevel, on_delete=models.CASCADE, related_name='semesters')
    semester_number = models.PositiveIntegerField(choices=SEMESTER_CHOICES)
    name = models.CharField(max_length=50, blank=True)
    
    class Meta:
        unique_together = ['year_level', 'semester_number']
        ordering = ['semester_number']
    
    def __str__(self):
        return f"{self.year_level} - Semester {self.semester_number}"
    
    def save(self, *args, **kwargs):
        if not self.name:
            self.name = f"Semester {self.semester_number}"
        super().save(*args, **kwargs)


def note_file_path(instance, filename):
    return f"notes/{instance.semester.year_level.academic_year.course.faculty.code}/{instance.semester.year_level.academic_year.course.code}/{instance.semester.year_level.academic_year.year}/{instance.semester.year_level.name.replace(' ', '_')}/semester_{instance.semester.semester_number}/{filename}"


def preview_file_path(instance, filename):
    return f"previews/{instance.semester.year_level.academic_year.course.faculty.code}/{instance.semester.year_level.academic_year.course.code}/{instance.semester.year_level.academic_year.year}/{instance.semester.year_level.name.replace(' ', '_')}/semester_{instance.semester.semester_number}/{filename}"


class Note(models.Model):
    NOTE_TYPES = [
        ('lecture', 'Lecture Notes'),
        ('assignment', 'Assignment'),
        ('exam', 'Past Exam'),
        ('reference', 'Reference Material'),
        ('other', 'Other'),
    ]
    
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to=note_file_path)
    note_type = models.CharField(max_length=20, choices=NOTE_TYPES, default='lecture')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_size = models.PositiveIntegerField(blank=True, null=True)
    
    # Preview functionality
    preview_file = models.FileField(upload_to=preview_file_path, blank=True, null=True, 
                                   help_text="Auto-generated preview file (first page + sample question)")
    has_preview = models.BooleanField(default=False)
    preview_generated_at = models.DateTimeField(blank=True, null=True)
    
    # Payment tracking (for future use)
    is_premium = models.BooleanField(default=False, help_text="Requires payment to view/download")
    view_count = models.PositiveIntegerField(default=0)
    download_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.title} - {self.semester}"
    
    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)
        
        # Auto-generate preview for PDF files
        if self.file and self.file.name.lower().endswith('.pdf') and not self.has_preview:
            self.generate_preview()
    
    def generate_preview(self):
        """Generate preview file from PDF (first page + sample question)"""
        # This would be implemented with a PDF processing library like PyPDF2
        # For now, we'll just mark as having preview capability
        try:
            # TODO: Implement actual PDF preview generation
            # - Extract first page
            # - Extract one sample question/problem
            # - Create new PDF with just these elements
            
            self.has_preview = True
            self.preview_generated_at = timezone.now()
            self.save(update_fields=['has_preview', 'preview_generated_at'])
        except Exception as e:
            print(f"Error generating preview for {self.title}: {e}")
    
    @property
    def file_size_mb(self):
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return None
    
    @property
    def file_extension(self):
        if self.file:
            return os.path.splitext(self.file.name)[1].lower()
        return None


# Payment System Models (for future use - currently commented out functionality)
class Payment(models.Model):
    """Track student payments for accessing papers"""
    PAYMENT_TYPES = [
        ('view', 'View Access'),
        ('download', 'Download Access'),
    ]
    
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_METHODS = [
        ('mtn', 'MTN Mobile Money'),
        ('airtel', 'Airtel Money'),
        ('admin', 'Admin Grant'),  # For free access granted by admin
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='payments')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    
    # Mobile money details
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    external_ref = models.CharField(max_length=100, blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        unique_together = ['student', 'note', 'payment_type']  # One payment per type per student per note
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student.full_name} - {self.note.title} ({self.payment_type})"


class StudentAccess(models.Model):
    """Track what students have access to (paid or free)"""
    ACCESS_TYPES = [
        ('preview', 'Preview Only'),
        ('view', 'Full View'),
        ('download', 'Download'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='access_records')
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='access_records')
    access_type = models.CharField(max_length=20, choices=ACCESS_TYPES)
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, null=True)  # For time-limited access
    is_active = models.BooleanField(default=True)
    
    # Track usage
    last_accessed = models.DateTimeField(blank=True, null=True)
    access_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        unique_together = ['student', 'note', 'access_type']
        ordering = ['-granted_at']
    
    def __str__(self):
        return f"{self.student.full_name} - {self.note.title} ({self.access_type})"
    
    def has_valid_access(self):
        """Check if access is still valid"""
        if not self.is_active:
            return False
        if self.expires_at and timezone.now() > self.expires_at:
            return False
        return True