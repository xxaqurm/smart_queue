import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    username = models.CharField(unique=True, max_length=50)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=20)

class Owner(models.Model):
    token = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True, blank=True, null=True)
    password = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.name:
            return f"{self.name} ({self.token})"
        return f"Owner {self.token}"

    @property
    def token_id(self):
        return str(self.token)

class Queue(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
    ]

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    served_count = models.IntegerField(default=0)
    start_at = models.IntegerField()
    fullness = models.IntegerField()
    capacity = models.IntegerField()
    owner = models.OneToOneField(Owner, on_delete=models.CASCADE, related_name='queue')

    def __str__(self):
        return self.name


class Participant(models.Model):
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('served', 'Served'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.AutoField(primary_key=True)
    queue = models.OneToOneField(Queue, on_delete=models.CASCADE, related_name='participants')
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    position = models.IntegerField(unique=True)

    class Meta:
        unique_together = ['queue', 'email']

    def __str__(self):
        return f"{self.name} ({self.position})"