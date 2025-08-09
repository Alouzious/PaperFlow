from django.db import models
from django.core.exceptions import ValidationError
from PIL import Image
from django.utils import timezone
import uuid
import os
import uuid
# Create your models here.from django.db import models


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

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if SiteSettings.objects.exists() and not self.pk:
            raise ValidationError("Only one SiteSettings instance is allowed.")

    def __str__(self):
        return self.site_name or "Site Settings"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Resize the image if necessary
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
        super().save(*args, **kwargs)  # Save first to get image path

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
    image_preview.allow_tags = True  # For Django <2.0; no longer needed in latest Django



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
        super().save(*args, **kwargs)  # Save the instance first to have image path

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
    image_preview.allow_tags = True  # For Django < 2.0, not needed for newer versions






# models.py
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
import os

class Faculty(models.Model):
    """
    Top-level category - e.g., Faculty of Computing (FoCLICS), Faculty of Education
    """
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=10, unique=True)  # e.g., "FoCLICS"
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Faculties"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class Course(models.Model):
    """
    Courses under each faculty - e.g., BCS, DCS, BIT, DIT
    """
    COURSE_TYPES = [
        ('bachelor', "Bachelor's Degree"),
        ('diploma', 'Diploma'),
        ('certificate', 'Certificate'),
    ]
    
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='courses')
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=10)  # e.g., "BCS", "DCS"
    course_type = models.CharField(max_length=20, choices=COURSE_TYPES)
    duration_years = models.PositiveIntegerField()  # e.g., 3 for bachelor's, 2 for diploma
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['faculty', 'code']  # Course codes unique within each faculty
        ordering = ['name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class AcademicYear(models.Model):
    """
    Academic years - only keeps the latest 2 years
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='academic_years')
    year = models.PositiveIntegerField()  # e.g., 2024, 2023
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['course', 'year']
        ordering = ['-year']  # Most recent first
    
    def __str__(self):
        return f"{self.course.code} - {self.year}"
    
    def save(self, *args, **kwargs):
        # Ensure only one current year per course
        if self.is_current:
            AcademicYear.objects.filter(course=self.course, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)
        
        # Auto-delete old years (keep only 2 most recent)
        self.cleanup_old_years()
    
    def cleanup_old_years(self):
        """Keep only the 2 most recent academic years for this course"""
        years_to_keep = AcademicYear.objects.filter(course=self.course).order_by('-year')[:2]
        years_to_delete = AcademicYear.objects.filter(course=self.course).exclude(
            id__in=[year.id for year in years_to_keep]
        )
        years_to_delete.delete()


class YearLevel(models.Model):
    """
    Year levels within each academic year - Year 1, Year 2, Year 3, etc.
    """
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='year_levels')
    level = models.PositiveIntegerField()  # 1, 2, 3, etc.
    name = models.CharField(max_length=50)  # "Year 1", "Year 2", etc.
    
    class Meta:
        unique_together = ['academic_year', 'level']
        ordering = ['level']
    
    def __str__(self):
        return f"{self.academic_year.course.code} {self.academic_year.year} - {self.name}"
    
    def clean(self):
        # Validate that year level doesn't exceed course duration
        if self.level > self.academic_year.course.duration_years:
            raise ValidationError(
                f"Year {self.level} exceeds course duration of {self.academic_year.course.duration_years} years"
            )


class Semester(models.Model):
    """
    Semesters within each year level - Semester 1 and Semester 2
    """
    SEMESTER_CHOICES = [
        (1, 'Semester 1'),
        (2, 'Semester 2'),
    ]
    
    year_level = models.ForeignKey(YearLevel, on_delete=models.CASCADE, related_name='semesters')
    semester_number = models.PositiveIntegerField(choices=SEMESTER_CHOICES)
    name = models.CharField(max_length=50, blank=True)  # Auto-generated if empty
    
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
    """Generate file path for uploaded notes"""
    return f"notes/{instance.semester.year_level.academic_year.course.faculty.code}/{instance.semester.year_level.academic_year.course.code}/{instance.semester.year_level.academic_year.year}/{instance.semester.year_level.name.replace(' ', '_')}/semester_{instance.semester.semester_number}/{filename}"


class Note(models.Model):
    """
    Notes/resources uploaded for each semester
    """
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
    file_size = models.PositiveIntegerField(blank=True, null=True)  # in bytes
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.title} - {self.semester}"
    
    def save(self, *args, **kwargs):
        # Calculate file size
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)
    
    @property
    def file_size_mb(self):
        """Return file size in MB"""
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return None
    
    @property
    def file_extension(self):
        """Get file extension"""
        if self.file:
            return os.path.splitext(self.file.name)[1].lower()
        return None