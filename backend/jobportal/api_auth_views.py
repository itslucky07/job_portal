from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import StudentUser, RecruiterUser
from .serializers import MyTokenObtainPairSerializer, StudentUserSerializer, RecruiterUserSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def register_student(request):
    try:
        data = request.data
        fname = data.get('fname', '')
        lname = data.get('lname', '')
        email = data.get('email', '')
        password = data.get('password', '')
        contact = data.get('contact', '')
        gender = data.get('gender', '')
        image = request.FILES.get('image', None)

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=email).exists():
            return Response({"error": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=fname,
                last_name=lname
            )
            student = StudentUser.objects.create(
                user=user,
                mobile=contact,
                image=image,
                gender=gender,
                type="student"
            )

        return Response({"success": "Student registered successfully!"}, status=status.HTTP_201_CREATED)

    except Exception as e:
        print("Registration Error:", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def register_recruiter(request):
    try:
        data = request.data
        fname = data.get('fname', '')
        lname = data.get('lname', '')
        email = data.get('email', '')
        password = data.get('password', '')
        contact = data.get('contact', '')
        gender = data.get('gender', '')
        company = data.get('company', '')
        image = request.FILES.get('image', None)

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=email).exists():
            return Response({"error": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=fname,
                last_name=lname
            )
            recruiter = RecruiterUser.objects.create(
                user=user,
                mobile=contact,
                image=image,
                gender=gender,
                company=company,
                type="recruiter",
                status="pending"
            )

        return Response({"success": "Recruiter registration submitted! Pending admin approval."}, status=status.HTTP_201_CREATED)

    except Exception as e:
        print("Registration Error:", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def user_profile(request):
    user = request.user
    role = 'student'

    recruiter = RecruiterUser.objects.filter(user=user).first()
    student = StudentUser.objects.filter(user=user).first()

    if recruiter:
        role = 'recruiter'
        profile_obj = recruiter
        serializer_class = RecruiterUserSerializer
    elif student:
        role = 'student'
        profile_obj = student
        serializer_class = StudentUserSerializer
    else:
        return Response({"id": user.id, "username": user.username, "role": "admin"})

    if request.method == 'GET':
        serializer = serializer_class(profile_obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        data = request.data
        
        # Update User model fields
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.save()

        # Update Profile model fields
        profile_obj.mobile = data.get('mobile', profile_obj.mobile)
        profile_obj.gender = data.get('gender', profile_obj.gender)

        if role == 'recruiter':
            profile_obj.company = data.get('company', profile_obj.company)

        # Handle image files if provided
        if 'image' in request.FILES:
            profile_obj.image = request.FILES['image']
        
        # Handle resume PDF for students
        if role == 'student' and 'resume_pdf' in request.FILES:
            profile_obj.resume_pdf = request.FILES['resume_pdf']

        profile_obj.save()
        serializer = serializer_class(profile_obj)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    try:
        data = request.data
        email = data.get('email', '').strip()
        mobile = data.get('mobile', '').strip()
        new_password = data.get('new_password', '').strip()

        if not email or not mobile or not new_password:
            return Response({"error": "Email, mobile number, and new password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username=email).first()
        if not user:
            return Response({"error": "No user found with this email."}, status=status.HTTP_404_NOT_FOUND)

        # Check if student or recruiter has this mobile number
        student = StudentUser.objects.filter(user=user, mobile=mobile).first()
        recruiter = RecruiterUser.objects.filter(user=user, mobile=mobile).first()

        if not student and not recruiter:
            return Response({"error": "Mobile contact number does not match our records for this email."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"success": "Password reset successfully! Please log in with your new password."}, status=status.HTTP_200_OK)

    except Exception as e:
        print("Forgot Password Error:", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
