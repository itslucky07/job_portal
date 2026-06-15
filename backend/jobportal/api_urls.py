from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from . import api_auth_views
from . import api_views

urlpatterns = [
    # General API endpoints
    path('check/', views.api_check, name='api_check'),
    path('latest-jobs/', views.latest_jobs_api, name='latest_jobs_api'),

    # Auth API endpoints
    path('auth/login/', api_auth_views.MyTokenObtainPairView.as_view(), name='api_token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='api_token_refresh'),
    path('auth/register/student/', api_auth_views.register_student, name='api_register_student'),
    path('auth/register/recruiter/', api_auth_views.register_recruiter, name='api_register_recruiter'),
    path('auth/profile/', api_auth_views.user_profile, name='api_user_profile'),
    path('auth/forgot-password/', api_auth_views.forgot_password, name='api_forgot_password'),

    # Jobs Core API
    path('jobs/', api_views.jobs_list_api, name='api_jobs_list'),
    path('jobs/<int:pid>/', api_views.job_detail_api, name='api_job_detail'),
    path('jobs/<int:pid>/apply/', api_views.apply_job_api, name='api_apply_job'),
    path('jobs/<int:pid>/save/', api_views.save_job_api, name='api_save_job'),

    # Recruiter Dashboard APIs
    path('recruiter/dashboard/', api_views.recruiter_dashboard_api, name='api_recruiter_dashboard'),
    path('recruiter/add-job/', api_views.add_job_api, name='api_add_job'),
    path('recruiter/jobs/<int:pid>/', api_views.manage_job_api, name='api_manage_job'),
    path('recruiter/applicants/', api_views.recruiter_applicants_api, name='api_recruiter_applicants'),
    path('recruiter/applications/<int:application_id>/', api_views.update_application_status_api, name='api_update_app_status'),

    # Student Dashboard APIs
    path('student/dashboard/', api_views.student_dashboard_api, name='api_student_dashboard'),
    path('student/resume/', api_views.student_resume_api, name='api_student_resume'),

    # Admin Control Panel APIs
    path('admin/dashboard/', api_views.admin_dashboard_api, name='api_admin_dashboard'),
    path('admin/recruiters/', api_views.admin_recruiters_list_api, name='api_admin_recruiters'),
    path('admin/recruiters/<int:recruiter_id>/approve/', api_views.admin_approve_recruiter_api, name='api_admin_approve_recruiter'),
    path('admin/candidates/', api_views.admin_candidates_list_api, name='api_admin_candidates'),
    path('admin/candidates/<int:student_id>/', api_views.admin_candidates_list_api, name='api_admin_delete_candidate'),

    # Chat / Direct Messaging APIs
    path('chat/partners/', api_views.chat_partners_api, name='api_chat_partners'),
    path('chat/history/<int:recipient_id>/', api_views.chat_history_api, name='api_chat_history'),
    path('chat/send/', api_views.send_message_api, name='api_send_message'),
    path('users/<int:user_id>/', api_views.user_detail_api, name='api_user_detail'),
]
