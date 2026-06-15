from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db import models
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from datetime import date, datetime

from .models import StudentUser, RecruiterUser, Job, Apply, SavedJob, Resume, Message
from .serializers import JobSerializer, StudentUserSerializer, RecruiterUserSerializer

# ==========================================
# PHASE B: JOBS CORE SEARCH & DETAIL APIS
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def jobs_list_api(request):
    search = request.GET.get('search', '').strip()
    location = request.GET.get('location', '').strip()
    
    jobs = Job.objects.all().order_by('-creationdate')
    
    if search:
        jobs = jobs.filter(
            models.Q(title__icontains=search) | 
            models.Q(skills__icontains=search) | 
            models.Q(description__icontains=search)
        )
    if location:
        jobs = jobs.filter(location__icontains=location)
        
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def job_detail_api(request, pid):
    job = get_object_or_404(Job, id=pid)
    serializer = JobSerializer(job)
    return Response(serializer.data)

# ==========================================
# PHASE C: RECRUITER OPERATION APIS
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def add_job_api(request):
    user = request.user
    recruiter = get_object_or_404(RecruiterUser, user=user)
    
    if recruiter.status != 'Accept':
        return Response({"error": "Your recruiter profile is pending admin approval."}, status=status.HTTP_403_FORBIDDEN)
        
    data = request.data
    title = data.get('title')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    salary = data.get('salary', 0)
    experience = data.get('experience', '')
    location = data.get('location', '')
    skills = data.get('skills', '')
    description = data.get('description', '')
    image = request.FILES.get('image', None)

    try:
        job = Job.objects.create(
            recruiter_user=recruiter,
            title=title,
            start_date=start_date,
            end_date=end_date,
            salary=float(salary),
            experience=experience,
            location=location,
            skills=skills,
            description=description,
            image=image,
            creationdate=date.today()
        )
        return Response(JobSerializer(job).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def manage_job_api(request, pid):
    job = get_object_or_404(Job, id=pid)
    recruiter = get_object_or_404(RecruiterUser, user=request.user)
    
    if job.recruiter_user != recruiter:
        return Response({"error": "You do not own this job listing."}, status=status.HTTP_403_FORBIDDEN)
        
    if request.method == 'DELETE':
        job.delete()
        return Response({"success": "Job deleted successfully."})
        
    elif request.method == 'PUT':
        data = request.data
        job.title = data.get('title', job.title)
        job.start_date = data.get('start_date', job.start_date)
        job.end_date = data.get('end_date', job.end_date)
        job.salary = float(data.get('salary', job.salary))
        job.experience = data.get('experience', job.experience)
        job.location = data.get('location', job.location)
        job.skills = data.get('skills', job.skills)
        job.description = data.get('description', job.description)
        
        if 'image' in request.FILES:
            job.image = request.FILES['image']
            
        job.save()
        return Response(JobSerializer(job).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recruiter_dashboard_api(request):
    recruiter = get_object_or_404(RecruiterUser, user=request.user)
    posted_jobs = Job.objects.filter(recruiter_user=recruiter).order_by('-creationdate')
    
    # Calculate stats
    total_posted = posted_jobs.count()
    applicants_count = Apply.objects.filter(job__recruiter_user=recruiter).count()
    approved_count = Apply.objects.filter(job__recruiter_user=recruiter, status='Accept').count()
    
    jobs_serializer = JobSerializer(posted_jobs, many=True)
    
    return Response({
        "stats": {
            "total_posted": total_posted,
            "applicants_count": applicants_count,
            "approved_count": approved_count
        },
        "jobs": jobs_serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recruiter_applicants_api(request):
    recruiter = get_object_or_404(RecruiterUser, user=request.user)
    applications = Apply.objects.filter(job__recruiter_user=recruiter).order_by('-applydate')
    
    result = []
    for app in applications:
        result.append({
            "id": app.id,
            "job_title": app.job.title,
            "job_id": app.job.id,
            "apply_date": app.applydate,
            "status": app.status,
            "resume_url": app.resume.url if app.resume else None,
            "student": {
                "id": app.student.id,
                "user_id": app.student.user.id,
                "first_name": app.student.user.first_name,
                "last_name": app.student.user.last_name,
                "email": app.student.user.username,
                "mobile": app.student.mobile,
                "gender": app.student.gender
            }
        })
    return Response(result)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_application_status_api(request, application_id):
    recruiter = get_object_or_404(RecruiterUser, user=request.user)
    application = get_object_or_404(Apply, id=application_id)
    
    if application.job.recruiter_user != recruiter:
        return Response({"error": "You are not authorized to update this application."}, status=status.HTTP_403_FORBIDDEN)
        
    status_val = request.data.get('status') # 'Accept' or 'Reject'
    if status_val not in ['Accept', 'Reject', 'Pending']:
        return Response({"error": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)
        
    application.status = status_val
    application.save()
    return Response({"success": f"Application status updated to {status_val}."})

# ==========================================
# PHASE D: STUDENT DASHBOARD & RESUME APIS
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def apply_job_api(request, pid):
    student = get_object_or_404(StudentUser, user=request.user)
    job = get_object_or_404(Job, id=pid)
    
    # Check if already applied
    if Apply.objects.filter(student=student, job=job).exists():
        return Response({"error": "You have already applied to this job."}, status=status.HTTP_400_BAD_REQUEST)
        
    resume_file = request.FILES.get('resume', None)
    if not resume_file:
        return Response({"error": "Resume file is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    app = Apply.objects.create(
        job=job,
        student=student,
        resume=resume_file,
        applydate=date.today(),
        status="Pending"
    )
    return Response({"success": "Applied successfully!"}, status=status.HTTP_201_CREATED)

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def save_job_api(request, pid):
    student = get_object_or_404(StudentUser, user=request.user)
    job = get_object_or_404(Job, id=pid)
    
    saved_obj = SavedJob.objects.filter(student=student, job=job).first()
    
    if request.method == 'POST':
        if saved_obj:
            return Response({"message": "Job is already saved."})
        SavedJob.objects.create(student=student, job=job)
        return Response({"success": "Job saved successfully."})
        
    elif request.method == 'DELETE':
        if not saved_obj:
            return Response({"error": "Job is not saved."}, status=status.HTTP_400_BAD_REQUEST)
        saved_obj.delete()
        return Response({"success": "Job removed from saved list."})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard_api(request):
    student = get_object_or_404(StudentUser, user=request.user)
    
    applied = Apply.objects.filter(student=student).order_by('-applydate')
    saved = SavedJob.objects.filter(student=student).order_by('-saved_date')
    
    applied_data = []
    for app in applied:
        applied_data.append({
            "id": app.id,
            "status": app.status,
            "apply_date": app.applydate,
            "job": JobSerializer(app.job).data
        })
        
    saved_data = []
    for s in saved:
        saved_data.append({
            "id": s.id,
            "saved_date": s.saved_date,
            "job": JobSerializer(s.job).data
        })
        
    return Response({
        "applied": applied_data,
        "saved": saved_data
    })

@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def student_resume_api(request):
    student = get_object_or_404(StudentUser, user=request.user)
    resume = Resume.objects.filter(student_user=student).first()
    
    if request.method == 'GET':
        if not resume:
            return Response({"error": "No resume details found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            "description": resume.description,
            "experience": resume.experience,
            "location": resume.location,
            "skills": resume.skills,
            "project": resume.project
        })
        
    data = request.data
    desc = data.get('description', '')
    exp = data.get('experience', '')
    loc = data.get('location', '')
    skills = data.get('skills', '')
    project = data.get('project', '')
    
    if resume:
        resume.description = desc
        resume.experience = exp
        resume.location = loc
        resume.skills = skills
        resume.project = project
        resume.save()
    else:
        resume = Resume.objects.create(
            student_user=student,
            description=desc,
            experience=exp,
            location=loc,
            skills=skills,
            project=project
        )
        
    return Response({"success": "Resume details saved successfully!"})

# ==========================================
# PHASE E: ADMIN CONSOLE APIS
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_api(request):
    if not request.user.is_staff:
        return Response({"error": "Admin permission required."}, status=status.HTTP_403_FORBIDDEN)
        
    total_students = StudentUser.objects.count()
    total_recruiters = RecruiterUser.objects.count()
    total_jobs = Job.objects.count()
    total_applications = Apply.objects.count()
    
    return Response({
        "total_students": total_students,
        "total_recruiters": total_recruiters,
        "total_jobs": total_jobs,
        "total_applications": total_applications
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_recruiters_list_api(request):
    if not request.user.is_staff:
        return Response({"error": "Admin permission required."}, status=status.HTTP_403_FORBIDDEN)
        
    recruiters = RecruiterUser.objects.all().order_by('-user__date_joined')
    serializer = RecruiterUserSerializer(recruiters, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_approve_recruiter_api(request, recruiter_id):
    if not request.user.is_staff:
        return Response({"error": "Admin permission required."}, status=status.HTTP_403_FORBIDDEN)
        
    recruiter = get_object_or_404(RecruiterUser, id=recruiter_id)
    status_val = request.data.get('status') # 'Accept' or 'Reject'
    
    if status_val not in ['Accept', 'Reject']:
        return Response({"error": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)
        
    recruiter.status = status_val
    recruiter.save()
    return Response({"success": f"Recruiter status updated to {status_val} successfully."})

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_candidates_list_api(request, student_id=None):
    if not request.user.is_staff:
        return Response({"error": "Admin permission required."}, status=status.HTTP_403_FORBIDDEN)
        
    if request.method == 'DELETE':
        student = get_object_or_404(StudentUser, id=student_id)
        # Delete user record which cascades to StudentUser profile
        student.user.delete()
        return Response({"success": "Candidate account deleted successfully."})
        
    students = StudentUser.objects.all().order_by('-user__date_joined')
    serializer = StudentUserSerializer(students, many=True)
    return Response(serializer.data)

# ==========================================
# PHASE 2: DIRECT CHAT & MESSAGING APIS
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_partners_api(request):
    user = request.user
    
    # Get all conversation partner IDs
    sent_to = Message.objects.filter(sender=user).values_list('receiver_id', flat=True)
    received_from = Message.objects.filter(receiver=user).values_list('sender_id', flat=True)
    
    partner_ids = set(list(sent_to) + list(received_from))
    partners = User.objects.filter(id__in=partner_ids).distinct()
    
    result = []
    for p in partners:
        p_role = 'student'
        p_company = ''
        recruiter = RecruiterUser.objects.filter(user=p).first()
        student = StudentUser.objects.filter(user=p).first()
        
        if recruiter:
            p_role = 'recruiter'
            p_company = recruiter.company
        elif student:
            p_role = 'student'
        else:
            p_role = 'admin'
            
        latest_msg = Message.objects.filter(
            (models.Q(sender=user) & models.Q(receiver=p)) |
            (models.Q(sender=p) & models.Q(receiver=user))
        ).order_by('-timestamp').first()
        
        result.append({
            "id": p.id,
            "username": p.username,
            "first_name": p.first_name,
            "last_name": p.last_name,
            "role": p_role,
            "company": p_company,
            "latest_message": latest_msg.content if latest_msg else "",
            "latest_timestamp": latest_msg.timestamp if latest_msg else None,
        })
    
    # Sort partners by latest message timestamp (newest first)
    result.sort(key=lambda x: x['latest_timestamp'] if x['latest_timestamp'] else datetime.min, reverse=True)
    return Response(result)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_history_api(request, recipient_id):
    user = request.user
    recipient = get_object_or_404(User, id=recipient_id)
    
    # Mark incoming messages from recipient as read
    Message.objects.filter(sender=recipient, receiver=user, is_read=False).update(is_read=True)
    
    messages = Message.objects.filter(
        (models.Q(sender=user) & models.Q(receiver=recipient)) |
        (models.Q(sender=recipient) & models.Q(receiver=user))
    ).order_by('timestamp')
    
    result = []
    for msg in messages:
        result.append({
            "id": msg.id,
            "sender_id": msg.sender.id,
            "sender_username": msg.sender.username,
            "receiver_id": msg.receiver.id,
            "receiver_username": msg.receiver.username,
            "content": msg.content,
            "timestamp": msg.timestamp,
            "is_read": msg.is_read
        })
    return Response(result)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message_api(request):
    sender = request.user
    data = request.data
    recipient_id = data.get('recipient_id')
    content = data.get('content')
    
    if not recipient_id or not content:
        return Response({"error": "recipient_id and content are required."}, status=status.HTTP_400_BAD_REQUEST)
        
    recipient = get_object_or_404(User, id=recipient_id)
    msg = Message.objects.create(sender=sender, receiver=recipient, content=content)
    
    return Response({
        "id": msg.id,
        "sender_id": msg.sender.id,
        "receiver_id": msg.receiver.id,
        "content": msg.content,
        "timestamp": msg.timestamp
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail_api(request, user_id):
    u = get_object_or_404(User, id=user_id)
    u_role = 'student'
    u_company = ''
    rec = RecruiterUser.objects.filter(user=u).first()
    stud = StudentUser.objects.filter(user=u).first()
    
    if rec:
        u_role = 'recruiter'
        u_company = rec.company
    elif stud:
        u_role = 'student'
        
    return Response({
        "id": u.id,
        "username": u.username,
        "first_name": u.first_name,
        "last_name": u.last_name,
        "role": u_role,
        "company": u_company
    })

