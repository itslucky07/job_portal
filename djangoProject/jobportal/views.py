from typing import Dict
from django.contrib.auth.models import User
from django.contrib import messages
from .models import StudentUser
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from .models import *

# Create your views here.
def index(request):
    return render(request, 'index.html')

def filter(request):
    return render(request, 'filter.html')

def filter2(request):
    return render(request, 'filter2.html')

def main(request):
    return render(request, 'main.html')

def about(request):
    return render(request, 'about.html')

def index2(request):
    return render(request, 'index2.html')

def pro(request):
    return render(request, 'pro.css')

def profile(request):
    return render(request, 'profile.html')

def user_navigation(request):
    return render(request, 'user_navigation.html')

def user_home(request):
    if not request.user.is_authenticated:
        return redirect('user_login')
    return render(request, 'user_home.html')

def recruiter_home(request):
    if not request.user.is_authenticated:
        return redirect('recuiter_login')
    return render(request, 'recruiter_home.html')

def admin_home(request):
    if not request.user.is_authenticated:
        return redirect('admin_login')
    return render(request, 'admin_home.html')

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
        student = User.objects.get(id=pid)
        student.delete()
        messages.success(request, "User deleted successfully.")
    except StudentUser.DoesNotExist:
        messages.error(request, "User does not exist.")
    return redirect('view_user')

def delete_user(request, pid):
    try:
        student = User.objects.get(id=pid)
        student.delete()
        messages.success(request, "User deleted successfully.")
    except StudentUser.DoesNotExist:
        messages.error(request, "User does not exist.")
    return redirect('view_user')

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

def change_passwordadmin(request):
    if not request.user.is_authenticated:
        return redirect('admin_login')
    error=""
     
    if request.method=='POST':
        old_password=request.POST['currentpassword']
        new_password=request.POST['newpassword']
         
        try:
            u=User.objects.get(id=request.user.id)
             
            if u.check_password(old_password):
                u.set_password(new_password)
                u.save()
                error="no"
            else:
                error="no"
        except:
            error="yes"
    d= {'error':error}
    return render(request,'change_password.html',d)


def Logout(request):
    logout(request)
    return render('index')

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
            AdminUser.objects.create(user=user, mobile=contact, image=image, gender=gender, type="admin")
            error = "no"
        except:
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
        company = request.POST['Company']

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

























































































































