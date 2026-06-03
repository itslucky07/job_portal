"""
URL configuration for djangoProject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from jobportal.views import *
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    
    path('admin/', admin.site.urls),
    path('', index,name='index'),
    path('admin_signup', admin_signup,name='admin_signup'),
    path('admin_login', admin_login,name='admin_login'),
    path('admin_home', admin_home, name='admin_home'),
    path("view_user", view_user, name="view_user"),
    path('recruiter_signup', recruiter_signup,name='recruiter_signup'),
    path('recruiter_login', recruiter_login,name='recruiter_login'),
    path('recruiter_home', recruiter_home, name='recruiter_home'),
    path('user_signup', user_signup,name='user_signup'),
    path('user_login', user_login,name='user_login'),
    path('user_home', user_home,name='user_home'),
    path('user_navigation', user_navigation,name='user_navigation'),
    path('user_filter',user_filter,name='user_filter'),
    path('filter3',filter3,name='filter3'),

    path('user_profile',user_profile,name='user_profile'),
    path('about',about,name='about'),
    path('index2',index2,name='index2'),
    path('pro',pro,name='pro'),
    path('Logout',Logout ,name='Logout'),
     path('recruiter_pending',recruiter_pending ,name='recruiter_pending'),
    path('recruiter_accepted',recruiter_accepted, name='recruiter_accepted'),
    path('recruiter_rejected',recruiter_rejected, name='recruiter_rejected'),
    path('recruiter_all',recruiter_all,name='recruiter_all'),
    path('delete_recruiter/<int:pid>', delete_recruiter, name='delete_recruiter'),
    path("add_job",add_job,name= 'add_job'),
    path('job_list',job_list,name='job_list'),
    path('edit_jobdetails/<int:pid>', edit_jobdetails, name='edit_jobdetails'),
    path('latest_job',latest_job, name='latest_job'),
    # path('latest_job2',latest_job2, name='latest_job2'),
    path('user_latestjob',user_latestjob, name='user_latestjob'),
    path('job_detail/<int:pid>',job_detail,name='job_detail'),
    path('apply_job/<int:pid>',apply_job, name='apply_job'),
    path('applied_candidatelist',applied_candidatelist,name='applied_candidatelist'),
    path('latestjob_home',latestjob_home,name='latestjob_home'),
    


    # path('change_companylogo/<int:pid',change_companylogo,name='change_companylogo'),
    path('change_companylogo/<int:pid>',change_companylogo, name='change_companylogo'),

    path("change_passwordadmin", change_passwordadmin , name="change_passwordadmin"),
    path("change_passworduser", change_passworduser , name="change_passworduser"),
    path("change_passwordrecruiter", change_passwordrecruiter , name="change_passwordrecruiter"),
    path('delete_user/<int:pid>', delete_user, name='delete_user'),
    path('delete_job/<int:pid>', delete_job, name='delete_job'),

    path('change_status/<int:pid>', change_status, name='change_status'), 
    path('user_dashboard',user_dashboard,name='user_dashboard'),
    path('resume',resume,name ='resume'),
    path('add_info',add_info,name='add_info'),





    
]+static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
