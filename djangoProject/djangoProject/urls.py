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
    path('filter',filter,name='filter'),
    path('filter2',filter2,name='filter2'),
    path('main',main,name='main'),
    path('profile',profile,name='profile'),
    path('about',about,name='about'),
    path('index2',index2,name='index2'),
    path('pro',pro,name='pro'),
    path('Logout',Logout ,name='Logout'),
     path('recruiter_pending',recruiter_pending ,name='recruiter_pending'),
    path('recruiter_accepted',recruiter_accepted, name='recruiter_accepted'),
    path('recruiter_rejected',recruiter_rejected, name='recruiter_rejected'),
    path('recruiter_all',recruiter_all,name='recruiter_all'),
    path('delete_recruiter/<int:pid>', delete_recruiter, name='delete_recruiter'),
    path("change_passwordadmin", change_passwordadmin , name="change_passwordadmin"),
    path("change_passworduser", change_passworduser , name="change_passworduser"),
    path('delete_user/<int:pid>', delete_user, name='delete_user'),
    path('change_status/<int:pid>', change_status, name='change_status'),


]+static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
