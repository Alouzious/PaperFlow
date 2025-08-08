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
    backgroundimage = models.ImageField(upload_to='backgrounds/', blank=True, null=True, help_text="Optional background image for the site")
    
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

