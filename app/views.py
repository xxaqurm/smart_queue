from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from .serializers import *


class AuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)

            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def register_owner(self, request):
        serializer = OwnerRegisterSerializer(data=request.data)
        if serializer.is_valid():
            owner = serializer.save()
            return Response({
                'message': 'Регистрация успешна',
                'token': str(owner.token),
                'owner': OwnerSerializer(owner).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class QueueViewSet(viewsets.ModelViewSet):
    queryset = Queue.objects.all().order_by('-start_at')
    serializer_class = QueueSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        queue = self.get_object()
        name = request.data.get('name')
        email = request.data.get('email')

        if not name or not email:
            return Response(
                {'error': 'Name and email are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Проверяем, не зарегистрирован ли уже пользователь
        if Participant.objects.filter(queue=queue, email=email).exists():
            return Response(
                {'error': 'Вы уже в этой очереди'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Определяем позицию - ИСПРАВЛЕНИЕ: учитываем только waiting
        last_position = Participant.objects.filter(
            queue=queue,
            status='waiting'
        ).order_by('-position').first()
        new_position = last_position.position + 1 if last_position else 1

        participant = Participant.objects.create(
            queue=queue,
            name=name,
            email=email,
            position=new_position
        )

        serializer = ParticipantSerializer(participant)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def serve_next(self, request, pk=None):
        queue = self.get_object()

        next_participant = Participant.objects.filter(
            queue=queue,
            status='waiting'
        ).order_by('position').first()

        if not next_participant:
            return Response(
                {'error': 'Нет ожидающих участников'},
                status=status.HTTP_400_BAD_REQUEST
            )

        next_participant.status = 'served'
        next_participant.save()

        queue.served_count += 1
        queue.save()

        serializer = ParticipantSerializer(next_participant)
        return Response(serializer.data)


class ParticipantViewSet(viewsets.ModelViewSet):
    serializer_class = ParticipantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Фильтруем по email текущего пользователя
        return Participant.objects.filter(email=self.request.user.email)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        participant = self.get_object()
        # Проверяем, что пользователь отменяет свое участие
        if participant.email != request.user.email:
            return Response(
                {'error': 'Вы можете отменять только свои участия'},
                status=status.HTTP_403_FORBIDDEN
            )
        participant.status = 'cancelled'
        participant.save()
        return Response({'status': 'cancelled'})


class OwnerViewSet(viewsets.ModelViewSet):
    queryset = Owner.objects.all()
    serializer_class = OwnerSerializer
    permission_classes = [IsAuthenticated]