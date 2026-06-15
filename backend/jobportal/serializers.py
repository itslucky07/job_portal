from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import StudentUser, RecruiterUser, Job

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'is_superuser']

class StudentUserSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = StudentUser
        fields = ['id', 'user', 'mobile', 'image', 'gender', 'type', 'resume_pdf']

class RecruiterUserSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = RecruiterUser
        fields = ['id', 'user', 'mobile', 'image', 'gender', 'company', 'status', 'type']

class JobSerializer(serializers.ModelSerializer):
    recruiter_user = RecruiterUserSerializer(read_only=True)
    class Meta:
        model = Job
        fields = [
            'id', 
            'recruiter_user', 
            'start_date', 
            'end_date', 
            'title', 
            'salary', 
            'image', 
            'description', 
            'experience', 
            'location', 
            'skills', 
            'creationdate'
        ]

# Custom JWT serializer to add user details in the token response
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        user = self.user
        role = 'student'
        status = 'active'
        profile_data = {}

        if user.is_superuser or user.is_staff:
            role = 'admin'
        else:
            # Check if recruiter
            recruiter = RecruiterUser.objects.filter(user=user).first()
            if recruiter:
                role = 'recruiter'
                status = recruiter.status
                profile_data = {
                    'mobile': recruiter.mobile,
                    'company': recruiter.company,
                    'gender': recruiter.gender
                }
            else:
                student = StudentUser.objects.filter(user=user).first()
                if student:
                    role = 'student'
                    profile_data = {
                        'mobile': student.mobile,
                        'gender': student.gender
                    }

        data['user'] = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': role,
            'status': status,
            'profile': profile_data
        }
        return data
