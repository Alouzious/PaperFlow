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
