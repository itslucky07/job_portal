from django.db import models
from django.contrib.auth.models import User

class StudentUser(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    mobile = models.CharField(max_length=15, null=True)
    image = models.FileField(null=True)
    gender = models.CharField(max_length=15, null=True)
    type = models.CharField(max_length=15, null=True)

    def __str__(self):
        return self.user.username

class AdminUser(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    mobile = models.CharField(max_length=15, null=True)
    image = models.FileField(null=True)
    gender = models.CharField(max_length=15, null=True)
    type = models.CharField(max_length=15, null=True)

    def __str__(self):
        return self.user.username

class RecruiterUser(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    mobile = models.CharField(max_length=15, null=True)
    image = models.FileField(null=True)
    gender = models.CharField(max_length=15, null=True)
    company = models.CharField(max_length=110, null=True)
    status = models.CharField(max_length=30, null=True)
    type = models.CharField(max_length=15, null=True)

    def __str__(self):
        return self.user.username

class Job(models.Model):
    recruiter_user = models.ForeignKey(RecruiterUser, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    title = models.CharField(max_length=100)
    salary = models.FloatField(max_length=20)
    image = models.FileField()
    description = models.CharField(max_length=300)
    experience = models.CharField(max_length=50)
    location = models.CharField(max_length=110)
    skills = models.CharField(max_length=110)
    creationdate = models.DateField()  # Corrected to DateField

   

    def __str__(self):
        return self.title  
class Apply(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    student =models.ForeignKey(StudentUser, on_delete=models.CASCADE)
    resume = models.FileField(null=True)
    applydate = models.DateField()

     
    def __str__(self):
        return str(self.id)  
    

 
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
   
    name = models.CharField(default='John Doe(Default)', max_length=200, null=True)
    image = models.ImageField(upload_to='media', null=True)
    mobile = models.CharField(max_length=15, null=True)
    gender = models.CharField(max_length=10, null=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class Resume(models.Model):
    student_user = models.ForeignKey(StudentUser, on_delete=models.CASCADE)
    description = models.CharField(max_length=300)
    experience = models.CharField(max_length=50)
    location = models.CharField(max_length=110)
    skills = models.CharField(max_length=110)
    project = models.CharField(max_length=150) 
    def _str_(self):
        return self.project