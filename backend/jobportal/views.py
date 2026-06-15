from typing import Dict
from django.contrib.auth.models import User
from django.contrib import messages
from .models import StudentUser
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from datetime import date
from .models import *

from django.utils.datastructures import MultiValueDictKeyError

# Create your views here.
def index(request):
    return render(request, 'index.html')

def latestjob_home(request):
 jobs = Job.objects.all()  # Corrected variable name from 'data' to 'jobs'
 d = {'jobs': jobs}  # Corrected variable name from 'jobs' to 'jobs'
 return render(request, 'latestjob_home.html', d)
 
def user_filter(request):
    job = Job.objects.all().order_by('-start_date')
    user = request.user
    student = StudentUser.objects.get(user=user)
    data = Apply.objects.filter(student=student)
    li = []
    for i in data:
        li.append(i.job.id)
    
    saved_jobs_list = SavedJob.objects.filter(student=student).values_list('job_id', flat=True)

    d = {'job': job, 'li': li, 'saved_jobs_list': saved_jobs_list}
    return render(request, 'user_filter.html',d)

 

def main(request):
    return render(request, 'main.html')

def about(request):
    return render(request, 'about.html')

def index2(request):
    return render(request, 'index2.html')

def pro(request):
    return render(request, 'pro.css')

 

# jobportal/views.py

from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from .models import Profile

def user_profile(request):
    # Retrieve the current user's profile information if it exists, otherwise return a 404 error
    user_profile = get_object_or_404(Profile, user=request.user)
    return render(request, 'your_app/user_profile.html', {'user_profile': user_profile})




def user_navigation(request):
    return render(request, 'user_navigation.html')


def admin_home(request):
    if not request.user.is_authenticated:
        return redirect('admin_login')
    
    total_students = StudentUser.objects.all().count()
    total_recruiters = RecruiterUser.objects.all().count()
    total_applications = Apply.objects.all().count()
    
    student_user_ids = StudentUser.objects.values_list('user_id', flat=True)
    recent_users = User.objects.filter(id__in=student_user_ids).order_by('-date_joined')[:5]
    recent_jobs = Job.objects.all().order_by('-creationdate')[:5]
    
    d = {
        'total_students': total_students,
        'total_recruiters': total_recruiters,
        'total_applications': total_applications,
        'recent_users': recent_users,
        'recent_jobs': recent_jobs,
    }
    return render(request, 'admin_home.html', d)

def view_user(request):
    if not request.user.is_authenticated:
        return redirect('admin_login')
    data=StudentUser.objects.all()
    d= {'data':data}
    return render(request,'view_user.html',d)
    # return render(request, 'admin_home.html')

def recruiter_pending(request):
    if not request.user.is_authenticated:
        return redirect('admin_login')
    data=RecruiterUser.objects.filter(status='pending')
    d= {'data':data}
    return render(request,'recruiter_pending.html',d)

def recruiter_accepted(request):
    if not request.user.is_authenticated:
        return redirect('admin_login')
    data=RecruiterUser.objects.filter(status='Accept')
    d= {'data':data}
    return render(request,'recruiter_accepted.html',d)

def recruiter_rejected(request):
    if not request.user.is_authenticated:
        return redirect('admin_login')
    data=RecruiterUser.objects.filter(status='Reject')
    d= {'data':data}
    return render(request,'recruiter_rejected.html',d)

def recruiter_all(request):
    if not request.user.is_authenticated:
        return redirect('admin_login')
    data=RecruiterUser.objects.all()
    d= {'data':data}
    return render(request,'recruiter_all.html',d)

def delete_recruiter(request, pid):
    try:
        user = User.objects.get(id=pid)
        user.delete()
        messages.success(request, "Recruiter deleted successfully.")
    except User.DoesNotExist:
        messages.error(request, "Recruiter does not exist.")
    return redirect('recruiter_all')

def delete_user(request, pid):
    try:
        student = User.objects.get(id=pid)
        student.delete()
        messages.success(request, "User deleted successfully.")
    except User.DoesNotExist:
        messages.error(request, "User does not exist.")
    return redirect('view_user')

def delete_job(request, pid):
    if not request.user.is_authenticated:
        return redirect('recruiter_login')

    try:
        job = get_object_or_404(Job, id=pid)  # Retrieve the job object or return 404 if not found
        job.delete()  # Delete the job
        messages.success(request, "Job deleted successfully.")  # Display success message
    except Job.DoesNotExist:
        messages.error(request, "Job does not exist.")  # Display error message if job not found

    return redirect('job_list')  # Redirect to job list page
def change_status(request,pid):
    if not request.user.is_authenticated:
        return redirect('admin_login')
    error=""
    recruiter=RecruiterUser.objects.get(id=pid)
    if request.method=='POST':
        status=request.POST['status']
        recruiter.status=status
        try:
            recruiter.save()
            error="no"
        except:
            error="yes"
    d= {'recruiter':recruiter,  'error':error}
    return render(request,'change_status.html',d)

def job_list(request):
    if not request.user.is_authenticated:
        return redirect('recruiter_login')
    
    user = request.user
    recruiter = RecruiterUser.objects.get(user=user)
    
    # Corrected the assignment of filtered jobs to a variable
    jobs = Job.objects.filter(recruiter_user=recruiter)
    
    d = {'jobs': jobs}  # Corrected the key name to 'jobs'
    return render(request, 'job_list.html', d)


def add_job(request):
    if not request.user.is_authenticated:
        return redirect('recruiter_login')
    error=""
    if request.method == 'POST':
        jt= request.POST['jobtitle']
        sd = request.POST['startdate']
        ed = request.POST['enddate']
        # sal= request.POST['salary']
        sal = request.POST['salary'].replace(',', '')  # Remove comma from salary string

        l= request.FILES['logo']
        exp = request.POST['experience']
        loc= request.POST['location']
        skills = request.POST['skills']
        desc= request.POST['description']
        user=request.user
        recruiter=RecruiterUser.objects.get(user=user)
        try:
            Job.objects.create(recruiter_user=recruiter, start_date=sd, end_date=ed,title=jt, salary=sal, image=l, description=desc, experience=exp, location=loc, skills=skills, creationdate=date.today())
            error = "no"  # Set error to "no" if job is added successfully
        except MultiValueDictKeyError as e:
            error = "yes"
            print(f"An error occurred: {e}")  # Print error for debugging
    d = {'error': error}
    return render(request, 'add_job.html', d)


def edit_jobdetails(request,pid):
    if not request.user.is_authenticated:
        return redirect('recruiter_login')
    error=""
    job=Job.objects.get(id=pid)
    if request.method == 'POST':
        jt= request.POST['jobtitle']
        sd = request.POST['startdate']
        ed = request.POST['enddate']
        # sal= request.POST['salary']
        sal = request.POST['salary'].replace(',', '')  # Remove comma from salary string
        # l= request.FILES['logo']
        exp = request.POST['experience']
        loc= request.POST['location']
        skills = request.POST['skills']
        desc= request.POST['description']        
        job.title=jt
        job.salary=sal
        job.experience=exp
        job.location=loc
        job.skills=skills
        job.description=desc
        try:
            job.save()
            error = "no"  # Set error to "no" if job is added successfully
        except MultiValueDictKeyError as e:
            error = "yes"
        if sd:
            try:
                job.start_date = sd
                job.save()
            except:
                pass
        else:
            pass  
        if ed:
            try:
                job.end_date = ed
                job.save()
            except:
                pass
        else:
            pass # If start date field is
            # print(f"An error occurred: {e}")  # Print error for debugging
    d = {'error': error, 'job': job}  
    return render(request, 'edit_jobdetails.html', d)


def change_companylogo(request,pid):
    if not request.user.is_authenticated:
        return redirect('recruiter_login')
    error=""
    job=Job.objects.get(id=pid)
    if request.method == 'POST':
        change_logo= request.FILES['logo']
        
        # user=request.user
        # recruiter=RecruiterUser.objects.get(user=user)
        
        job.image=change_logo
         
        try:
            job.save()
            error = "no"  # Set error to "no" if job is added successfully
        except MultiValueDictKeyError as e:
            error = "yes"
         
    d = {'error': error, 'job': job}  
    return render(request, 'change_companylogo.html', d) 







def change_passwordadmin(request):
    if not request.user.is_authenticated:
        return redirect('admin_login')
    
    error = ""
     
    if request.method == 'POST':
        c = request.POST.get('currentpassword')
        n = request.POST.get('newpassword')
         
        try:
            u = User.objects.get(id=request.user.id)
             
            if u.check_password(c):
                u.set_password(n)
                u.save()
                error = "no"  # Changed to "no" when password change is successful
            else:
                error = "not"  # Changed to "not" when current password is incorrect
        except User.DoesNotExist:
            error = "yes"  # Changed to "yes" when user is not found
    
    d = {'error': error}
    return render(request, 'change_passwordadmin.html', d)


def change_passworduser(request):
    if not request.user.is_authenticated:
        return redirect('user_login')
    
    error = ""
     
    if request.method == 'POST':
        c = request.POST.get('currentpassword')
        n = request.POST.get('newpassword')
         
        try:
            u = User.objects.get(id=request.user.id)
             
            if u.check_password(c):
                u.set_password(n)
                u.save()
                error = "no"  # Changed to "no" when password change is successful
            else:
                error = "not"  # Changed to "not" when current password is incorrect
        except User.DoesNotExist:
            error = "yes"  # Changed to "yes" when user is not found
    
    d = {'error': error}
    return render(request, 'change_passworduser.html', d)

def change_passwordrecruiter(request):
    if not request.user.is_authenticated:
        return redirect('recruiter_login')
    
    error = ""
     
    if request.method == 'POST':
        c = request.POST.get('currentpassword')
        n = request.POST.get('newpassword')
         
        try:
            u = User.objects.get(id=request.user.id)
             
            if u.check_password(c):
                u.set_password(n)
                u.save()
                error = "no"  # Changed to "no" when password change is successful
            else:
                error = "not"  # Changed to "not" when current password is incorrect
        except User.DoesNotExist:
            error = "yes"  # Changed to "yes" when user is not found
    
    d = {'error': error}
    return render(request, 'change_passwordrecruiter.html', d)



# def Logout(request):
#     logout(request)
#     return render('index')
 

def Logout(request):
    logout(request)
    return redirect('index')


def admin_signup(request):
    error = ""
    if request.method == 'POST':
        f = request.POST['fname']
        l = request.POST['lname']
        email = request.POST['email']
        password = request.POST['password']
        if 'image' in request.FILES:
            image = request.FILES['image']
        else:
            image = None
        contact = request.POST['contact']
        gender = request.POST['gender']
        try:
            user = User.objects.create_user(first_name=f, last_name=l, username=email, password=password)
            user.is_staff = True
            user.is_superuser = True
            user.save()
            AdminUser.objects.create(user=user, mobile=contact, image=image, gender=gender, type="admin")
            error = "no"
        except Exception as e:
            print("Admin signup error:", e)
            error = "yes"
    d = {'error': error}
    return render(request, 'admin_signup.html', d)

def admin_login(request):
    error = ""
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        try:
            if user.is_staff:
                login(request, user)
                error = "no"
            else:
                error = "yes"
        except:
            error = "yes"
    d = {'error': error}
    return render(request, 'admin_login.html', d)

def user_signup(request):
    error = ""
    if request.method == 'POST':
        f = request.POST['fname']
        l = request.POST['lname']
        email = request.POST['email']
        password = request.POST['password']
        if 'image' in request.FILES:
            image = request.FILES['image']
        else:
            image = None
        contact = request.POST['contact']
        gender = request.POST['gender']
        try:
            user = User.objects.create_user(first_name=f, last_name=l, username=email, password=password)
            StudentUser.objects.create(user=user, mobile=contact, image=image, gender=gender, type="student")
            error = "no"
        except:
            error = "yes"
    d = {'error': error}
    return render(request, 'user_signup.html', d)

def user_login(request):
    error = ""
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            try:
                user1 = StudentUser.objects.get(user=user)
                if user1.type == 'student':
                    login(request, user)
                    error = "no"
                else:
                    error = "yes"
            except StudentUser.DoesNotExist:
                error = "yes"
        else:
            error = "yes"
    d = {'error': error}
    return render(request, 'user_login.html', d)

def recruiter_signup(request):
    error = ""
    if request.method == 'POST':
        f = request.POST['fname']
        l = request.POST['lname']
        email = request.POST['email']
        password = request.POST['password']
        if 'image' in request.FILES:
            image = request.FILES['image']
        else:
            image = None
        contact = request.POST['contact']
        gender = request.POST['gender']
        company = request.POST['company']

        try:
            user = User.objects.create_user(first_name=f, last_name=l, username=email, password=password)
            RecruiterUser.objects.create(user=user, mobile=contact, image=image, gender=gender, company=company, type="recruiter", status="pending")
            error = "no"
        except:
            error = "yes"
    d = {'error': error}
    return render(request, 'recruiter_signup.html', d)

def recruiter_login(request):
    error = ""
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user:
            try:
                user1 = RecruiterUser.objects.get(user=user)
                if user1.type == 'recruiter' and user1.status != "pending":
                    login(request, user)
                    error = "no"
                elif user1.type == 'recruiter' and user1.status == "pending":
                    error = "pending"  # Set error to "pending" when status is pending

                else:
                    error = "This user is not a recruiter."
            except RecruiterUser.DoesNotExist:
                error = "User authentication failed."
        else:
            error = "yes"
    d = {'error': error}
    return render(request, 'recruiter_login.html', d)

def recruiter_home(request):
    if not request.user.is_authenticated:
        return redirect('recruiter_login')
    user = request.user
    recruiter = RecruiterUser.objects.get(user=user)
    error = ""
    if request.method == 'POST':
        f = request.POST['fname']
        l = request.POST['lname']
        contact = request.POST['contact']
        gen = request.POST['gender']

        recruiter.user.first_name = f
        recruiter.user.last_name = l
        recruiter.mobile = contact
        recruiter.gender = gen
        try:
            recruiter.save()
            recruiter.user.save()
            error = "no"
        except:
            error = "yes"
        
        try:
            i = request.FILES['image']
            recruiter.image = i
            recruiter.save()
            error = "no"
        except:
            pass

    d = {'recruiter': recruiter, 'error': error}
    return render(request, "recruiter_home.html", d)


from django.shortcuts import render, redirect
from .models import StudentUser, Apply, Job

def user_home(request):
    # Redirect to login page if user is not authenticated
    if not request.user.is_authenticated:
        return redirect('user_login')

    user = request.user
    try:
        student = StudentUser.objects.get(user=user)
    except StudentUser.DoesNotExist:
        # Handle case where StudentUser object does not exist for the user
        # You might want to handle this case based on your application's requirements
        return redirect('user_login')

    error = ""
    # Get the latest jobs
    latest_jobs = Job.objects.all().order_by('-creationdate')[:10000]  # Fetch the latest 3 jobs sorted by creation date
    
    if request.method == 'POST':
        f = request.POST.get('fname', '')
        l = request.POST.get('lname', '')
        contact = request.POST.get('contact', '')
        gen = request.POST.get('gender', '')

        # Update user details
        user.first_name = f
        user.last_name = l
        student.mobile = contact
        student.gender = gen

        try:
            user.save()
            student.save()
            error = "no"
        except Exception as e:
            print(e)
            error = "yes"
        
        # Handle profile image upload
        try:
            image = request.FILES.get('image')
            if image:
                student.image = image
                student.save()
        except Exception as e:
            print(e)
    
    # Retrieve applied jobs for the current user
    data = Apply.objects.filter(student=student)
    li = [i.job.id for i in data]

    # Retrieve saved jobs for the current user
    saved_jobs_list = SavedJob.objects.filter(student=student).values_list('job_id', flat=True)

    # Skill-based Job Recommendations
    student_resume = Resume.objects.filter(student_user=student).first()
    recommended_jobs = []
    if student_resume and student_resume.skills:
        skills_list = [s.strip().lower() for s in student_resume.skills.split(',')]
        from django.db.models import Q
        query = Q()
        for skill in skills_list:
            if skill.strip():
                query |= Q(skills__icontains=skill.strip()) | Q(title__icontains=skill.strip())
        if query:
            recommended_jobs = Job.objects.filter(query).exclude(id__in=li).distinct()[:6]
    
    context = {
        'latest_jobs': latest_jobs,
        'student': student,
        'error': error,
        'li': li,
        'saved_jobs_list': saved_jobs_list,
        'recommended_jobs': recommended_jobs,
    }
    return render(request, 'user_home.html', context)





def user_dashboard(request):
    if not request.user.is_authenticated:
        return redirect('user_login')
    user = request.user
    student = StudentUser.objects.get(user=user)
    error = ""
    if request.method == 'POST':
        f = request.POST['fname']
        l = request.POST['lname']
        contact = request.POST['contact']
        gen = request.POST['gender']

        student.user.first_name = f
        student.user.last_name = l
        student.mobile = contact
        student.gender = gen
        try:
            student.save()
            student.user.save()
            error = "no"
        except:
            error = "yes"
        
        try:
            i = request.FILES['image']
            student.image = i
            student.save()
            error = "no"
        except:
            pass

        try:
            pdf = request.FILES['resume_pdf']
            student.resume_pdf = pdf
            student.save()
            error = "no"
        except:
            pass

    d = {'student': student, 'error': error}
    return render(request, 'user_dashboard.html', d)

 



 

def latest_job(request):
    jobs = Job.objects.all()  # Corrected variable name from 'data' to 'jobs'
    d = {'jobs': jobs}  # Corrected variable name from 'jobs' to 'jobs'
    return render(request, 'latest_job.html', d)

def user_latestjob(request):
    jobs = Job.objects.all()
    user = request.user
    student = StudentUser.objects.get(user=request.user)
    data = Apply.objects.filter(student=student)
    li = [i.job.id for i in data]
    saved_jobs_list = SavedJob.objects.filter(student=student).values_list('job_id', flat=True)
    context = {'jobs': jobs, 'li': li, 'saved_jobs_list': saved_jobs_list}
    return render(request, 'user_latestjob.html', context)


def job_detail(request,pid):
    job =Job.objects.get(id=pid)
    d = {'job':job}
    return render(request,'job_detail.html',d)


def apply_job(request,pid):
    if not request.user.is_authenticated:
        return redirect('user_login')
    error = ""
    user = request.user
    student = StudentUser.objects.get(user=user)
    job = Job.objects.get(id=pid)
    date1 = date.today()

    print("Job End Date:", job.end_date)
    print("Current Date:", date1)
    print("Is job end date before current date?", job.end_date < date1)


    if job.end_date < date1:#see end_date
        error="close"
    elif job.start_date > date1:
        error="notopen"
    else:
        if request.method == 'POST':
            r = request.FILES['resume']
            Apply.objects.create(job=job,student = student,resume=r,applydate=date.today())
            error="done"
    print("error", error)
    d = {'error': error}
    return render(request, 'apply_job.html', d)


def applied_candidatelist(request):
    if not request.user.is_authenticated:
        return redirect('recruiter_login')
    
    try:
        recruiter = RecruiterUser.objects.get(user=request.user)
        data = Apply.objects.filter(job__recruiter_user=recruiter).order_by('-applydate')
    except RecruiterUser.DoesNotExist:
        if request.user.is_staff:
            data = Apply.objects.all().order_by('-applydate')
        else:
            return redirect('recruiter_login')

    d = {'data': data}
    return render(request, 'applied_candidatelist.html', d)



def resume(request):
    # Retrieve user and student details based on the current user
    user = request.user
    student_user = StudentUser.objects.get(user=user)

    # Retrieve resume details for the student user
    resume = Resume.objects.filter(student_user=student_user).first()

    # Pass the user, student, and resume data to the resume template
    context = {'user': user,'student_user': student_user,'resume': resume,
    }

    # Render the resume template with the context data
    return render(request, 'resume.html', context)

def add_info(request):
    if not request.user.is_authenticated:
        return redirect('user_login')

    error = ""
    user = request.user
    student = get_object_or_404(StudentUser, user=user)
    resume = Resume.objects.filter(student_user=student).first()

    if request.method == 'POST':
        exp = request.POST.get('experience', '')
        loc = request.POST.get('location', '')
        skills = request.POST.get('skills', '')
        desc = request.POST.get('description', '')
        project = request.POST.get('project', '')



        if resume:
            # Update existing Resume object
            resume.description = desc
            resume.experience = exp
            resume.location = loc
            resume.skills = skills
            resume.project = project
            resume.save()
            error = "no"
        else:
            try:
                # Create a new Resume object
                Resume.objects.create(student_user=student, description=desc, experience=exp, location=loc, skills=skills, project=project)
                error = "no"
            except Exception as e:
                error = "yes"
                print(f"An error occurred: {e}")

    context = {'error': error,'student': student,'resume': resume }
    return render(request, 'add_info.html', context)



from datetime import datetime, timedelta

def admin_home(request):
    # Total student users and recruiters
    total_students = StudentUser.objects.count()
    total_recruiters = RecruiterUser.objects.count()
    total_jobs = Job.objects.count()

    # Total applications
    total_applications = Apply.objects.count()

    # Recruiter status breakdown for pie charts
    rec_pending = RecruiterUser.objects.filter(status='pending').count()
    rec_accepted = RecruiterUser.objects.filter(status='Accept').count()
    rec_rejected = RecruiterUser.objects.filter(status='Reject').count()

    # Recent users registered within the last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_users = User.objects.filter(date_joined__gte=thirty_days_ago)

    # Recent job listings
    recent_jobs = Job.objects.order_by('-creationdate')[:5]  # Last 5 jobs

    context = {
        'total_students': total_students,
        'total_recruiters': total_recruiters,
        'total_jobs': total_jobs,
        'total_applications': total_applications,
        'rec_pending': rec_pending,
        'rec_accepted': rec_accepted,
        'rec_rejected': rec_rejected,
        'recent_users': recent_users,
        'recent_jobs': recent_jobs,
    }

    return render(request, 'admin_home.html', context)

def filter3(request):
    job = Job.objects.all().order_by('-start_date')

    # Directly pass the job queryset without any applied job conditions
    context = {'job': job}
    return render(request, 'filter3.html', context)

def applied_jobs(request):
    if not request.user.is_authenticated:
        return redirect('user_login')
    user = request.user
    try:
        student = StudentUser.objects.get(user=user)
    except StudentUser.DoesNotExist:
        return redirect('user_login')
    
    applied = Apply.objects.filter(student=student).order_by('-applydate')
    d = {'applied': applied}
    return render(request, 'applied_jobs.html', d)

def update_application_status(request, pid, status_val):
    if not request.user.is_authenticated:
        return redirect('recruiter_login')
    
    try:
        recruiter = RecruiterUser.objects.get(user=request.user)
    except RecruiterUser.DoesNotExist:
        return redirect('recruiter_login')

    application = get_object_or_404(Apply, id=pid)
    if application.job.recruiter_user == recruiter:
        application.status = status_val
        application.save()
        messages.success(request, f"Application status updated to {status_val} successfully.")
    else:
        messages.error(request, "You are not authorized to update this application.")
    
    return redirect('applied_candidatelist')

def bookmark_job(request, pid):
    if not request.user.is_authenticated:
        return redirect('user_login')
    
    try:
        student = StudentUser.objects.get(user=request.user)
    except StudentUser.DoesNotExist:
        return redirect('user_login')
        
    job = get_object_or_404(Job, id=pid)
    
    saved_query = SavedJob.objects.filter(student=student, job=job)
    if saved_query.exists():
        saved_query.delete()
        messages.info(request, "Job removed from bookmarks.")
    else:
        SavedJob.objects.create(student=student, job=job)
        messages.success(request, "Job saved to bookmarks successfully.")
        
    next_url = request.GET.get('next', 'user_filter')
    return redirect(next_url)

def saved_jobs(request):
    if not request.user.is_authenticated:
        return redirect('user_login')
        
    try:
        student = StudentUser.objects.get(user=request.user)
    except StudentUser.DoesNotExist:
        return redirect('user_login')
        
    saved = SavedJob.objects.filter(student=student).order_by('-saved_date')
    
    applied_data = Apply.objects.filter(student=student)
    applied_ids = [i.job.id for i in applied_data]
    
    d = {'saved': saved, 'applied_ids': applied_ids}
    return render(request, 'saved_jobs.html', d)

def chat_dashboard(request):
    if not request.user.is_authenticated:
        return redirect('index')
        
    user = request.user
    
    is_student = StudentUser.objects.filter(user=user).exists()
    is_recruiter = RecruiterUser.objects.filter(user=user).exists()
    
    sent_to = Message.objects.filter(sender=user).values_list('receiver_id', flat=True)
    received_from = Message.objects.filter(receiver=user).values_list('sender_id', flat=True)
    
    chat_partner_ids = set(list(sent_to) + list(received_from))
    chat_partners = User.objects.filter(id__in=chat_partner_ids)
    
    d = {
        'chat_partners': chat_partners,
        'is_student': is_student,
        'is_recruiter': is_recruiter,
    }
    return render(request, 'chat.html', d)

def chat_room(request, recipient_id):
    if not request.user.is_authenticated:
        return redirect('index')
        
    user = request.user
    recipient = get_object_or_404(User, id=recipient_id)
    
    is_student = StudentUser.objects.filter(user=user).exists()
    is_recruiter = RecruiterUser.objects.filter(user=user).exists()
    
    Message.objects.filter(sender=recipient, receiver=user, is_read=False).update(is_read=True)
    
    messages_list = Message.objects.filter(
        (models.Q(sender=user) & models.Q(receiver=recipient)) |
        (models.Q(sender=recipient) & models.Q(receiver=user))
    ).order_by('timestamp')
    
    sent_to = Message.objects.filter(sender=user).values_list('receiver_id', flat=True)
    received_from = Message.objects.filter(receiver=user).values_list('sender_id', flat=True)
    chat_partner_ids = set(list(sent_to) + list(received_from))
    chat_partners = User.objects.filter(id__in=chat_partner_ids)
    
    d = {
        'recipient': recipient,
        'chat_partners': chat_partners,
        'chat_messages': messages_list,
        'is_student': is_student,
        'is_recruiter': is_recruiter,
    }
    return render(request, 'chat.html', d)

def send_message(request, recipient_id):
    if not request.user.is_authenticated:
        return redirect('index')
        
    if request.method == 'POST':
        content = request.POST.get('content')
        recipient = get_object_or_404(User, id=recipient_id)
        if content:
            Message.objects.create(sender=request.user, receiver=recipient, content=content)
            
    return redirect('chat_room', recipient_id=recipient_id)


# API Endpoints for React Frontend
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .serializers import JobSerializer
from .models import Job

@api_view(['GET'])
@permission_classes([AllowAny])
def api_check(request):
    return Response({"status": "ok", "message": "Django backend is connected!"})

@api_view(['GET'])
@permission_classes([AllowAny])
def latest_jobs_api(request):
    jobs = Job.objects.all().order_by('-creationdate')[:10]
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)







































































































