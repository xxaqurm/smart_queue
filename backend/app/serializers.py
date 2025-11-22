from time import timezone
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (User, Owner, Queue, Participant)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError('Аккаунт отключен')
            else:
                raise serializers.ValidationError('Неверные учетные данные')
        else:
            raise serializers.ValidationError('Необходимо указать username и password')

        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],

        )
        return user


class OwnerSerializer(serializers.ModelSerializer):
    token_id = serializers.CharField(source='token', read_only=True)

    class Meta:
        model = Owner
        fields = ['token', 'name', 'email', 'password', 'is_active', 'created_at', 'token_id']
        read_only_fields = ['token', 'is_active', 'created_at']


class OwnerRegisterSerializer(serializers.ModelSerializer):
    token = serializers.UUIDField()

    class Meta:
        model = Owner
        fields = ['token', 'name', 'email', 'password']

    def validate_token(self, value):
        try:
            owner = Owner.objects.get(token=value, is_active=False)
        except Owner.DoesNotExist:
            raise serializers.ValidationError('Неверный токен или токен уже использован')
        return value

    def validate(self, data):
        # Проверяем email только если он не пустой в существующих записях
        if Owner.objects.filter(email=data['email']).exclude(email__isnull=True).exclude(email='').exists():
            raise serializers.ValidationError({'email': 'Этот email уже используется'})
        return data

    def create(self, validated_data):
        token = validated_data['token']
        owner = Owner.objects.get(token=token)

        owner.name = validated_data['name']
        owner.email = validated_data['email']
        owner.password = validated_data['password']
        owner.is_active = True
        owner.save()

        return owner

class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = '__all__'


class QueueSerializer(serializers.ModelSerializer):
    participants = ParticipantSerializer(many=True, read_only=True)
    owner = OwnerSerializer(read_only=True)
    current_waiting = serializers.SerializerMethodField()
    start_at = serializers.IntegerField(read_only=True)  # ← Только для чтения

    class Meta:
        model = Queue
        fields = '__all__'
        read_only_fields = ['start_at']  # ← start_at нельзя устанавливать через API

    def get_current_waiting(self, obj):
        try:
            return obj.participants.filter(status='waiting').count()
        except:
            return 0

    def create(self, validated_data):
        # Создаем очередь с статусом paused по умолчанию
        validated_data.setdefault('status', 'paused')

        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                owner = Owner.objects.get(email=request.user.email)
                if hasattr(owner, 'queue'):
                    raise serializers.ValidationError('У вас уже есть очередь')
                validated_data['owner'] = owner
            except Owner.DoesNotExist:
                raise serializers.ValidationError('Владелец не найден')

        return super().create(validated_data)