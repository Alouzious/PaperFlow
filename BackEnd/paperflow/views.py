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
