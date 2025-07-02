"""
Comprehensive RESTful API Views for Healthcare Application
Provides CRUD operations for all models with proper authentication and permissions
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta

# Import models
from authentication.models import User, PatientProfile, PhysiotherapistProfile
from appointments.models import Appointment, AppointmentFeedback, AppointmentDocument
from exercises.models import ExerciseCategory, Exercise, ExercisePlan, ExercisePlanItem, ExerciseProgress
from notifications.models import Notification, NotificationPreference
from chat.models import Conversation, Message, Attachment

# Import serializers
from authentication.serializers import (
    UserSerializer, PatientProfileSerializer, PhysiotherapistProfileSerializer,
    UserRegistrationSerializer, LoginSerializer, PasswordChangeSerializer
)
from appointments.serializers import (
    AppointmentSerializer, AppointmentFeedbackSerializer, AppointmentDocumentSerializer,
    AppointmentCreateSerializer, AppointmentUpdateSerializer
)
from exercises.serializers import (
    ExerciseCategorySerializer, ExerciseSerializer, ExercisePlanSerializer,
    ExercisePlanItemSerializer, ExerciseProgressSerializer
)
from notifications.serializers import NotificationSerializer, NotificationPreferenceSerializer
from chat.serializers import ConversationSerializer, MessageSerializer, AttachmentSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow owners of an object to edit it."""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only to the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'patient'):
            return obj.patient == request.user
        elif hasattr(obj, 'physiotherapist'):
            return obj.physiotherapist == request.user
        
        return obj == request.user


class IsPatientOrPhysiotherapist(permissions.BasePermission):
    """Permission for patient or physiotherapist access."""
    
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.user_type in ['patient', 'physiotherapist'])


# ============================================================================
# USER MANAGEMENT VIEWS
# ============================================================================

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User model with CRUD operations
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user_type', 'is_verified', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'username', 'email']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter queryset based on user permissions"""
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user statistics"""
        if not request.user.is_staff:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        stats = {
            'total_users': User.objects.count(),
            'patients': User.objects.filter(user_type='patient').count(),
            'physiotherapists': User.objects.filter(user_type='physiotherapist').count(),
            'verified_users': User.objects.filter(is_verified=True).count(),
            'active_users': User.objects.filter(is_active=True).count(),
        }
        return Response(stats)


class PatientProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PatientProfile model
    """
    queryset = PatientProfile.objects.all()
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['blood_type']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'emergency_contact_name']
    ordering_fields = ['created_at', 'user__username']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter based on user permissions"""
        if self.request.user.is_staff:
            return PatientProfile.objects.all()
        elif self.request.user.user_type == 'patient':
            return PatientProfile.objects.filter(user=self.request.user)
        elif self.request.user.user_type == 'physiotherapist':
            # Physiotherapists can see their patients
            return PatientProfile.objects.filter(
                user__appointment_patient__physiotherapist=self.request.user
            ).distinct()
        return PatientProfile.objects.none()


class PhysiotherapistProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PhysiotherapistProfile model
    """
    queryset = PhysiotherapistProfile.objects.all()
    serializer_class = PhysiotherapistProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_available', 'years_of_experience']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'specializations', 'clinic_name']
    ordering_fields = ['created_at', 'rating', 'years_of_experience']
    ordering = ['-rating', '-created_at']
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available physiotherapists"""
        available_physios = self.get_queryset().filter(is_available=True)
        serializer = self.get_serializer(available_physios, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_availability(self, request, pk=None):
        """Toggle physiotherapist availability"""
        physio = self.get_object()
        if physio.user != request.user and not request.user.is_staff:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        physio.is_available = not physio.is_available
        physio.save()
        return Response({'is_available': physio.is_available})


# ============================================================================
# APPOINTMENT MANAGEMENT VIEWS
# ============================================================================

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Appointment model with comprehensive CRUD operations
    """
    queryset = Appointment.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsPatientOrPhysiotherapist]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'appointment_type', 'payment_status', 'date']
    search_fields = ['patient__username', 'physiotherapist__username', 'reason', 'symptoms']
    ordering_fields = ['date', 'start_time', 'created_at']
    ordering = ['date', 'start_time']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AppointmentUpdateSerializer
        return AppointmentSerializer
    
    def get_queryset(self):
        """Filter appointments based on user role"""
        user = self.request.user
        if user.is_staff:
            return Appointment.objects.all()
        elif user.user_type == 'patient':
            return Appointment.objects.filter(patient=user)
        elif user.user_type == 'physiotherapist':
            return Appointment.objects.filter(physiotherapist=user)
        return Appointment.objects.none()
    
    def perform_create(self, serializer):
        """Set patient when creating appointment"""
        if self.request.user.user_type == 'patient':
            serializer.save(patient=self.request.user)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming appointments"""
        upcoming = self.get_queryset().filter(
            date__gte=timezone.now().date(),
            status__in=['scheduled', 'confirmed']
        ).order_by('date', 'start_time')
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's appointments"""
        today = self.get_queryset().filter(date=timezone.now().date())
        serializer = self.get_serializer(today, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment"""
        appointment = self.get_object()
        
        if not appointment.can_be_cancelled:
            return Response(
                {'error': 'Appointment cannot be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.cancelled_by = request.user
        appointment.cancellation_reason = request.data.get('reason', '')
        appointment.save()
        
        return Response({'message': 'Appointment cancelled successfully'})
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm an appointment"""
        appointment = self.get_object()
        
        if appointment.status != 'scheduled':
            return Response(
                {'error': 'Only scheduled appointments can be confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'confirmed'
        appointment.save()
        
        return Response({'message': 'Appointment confirmed successfully'})
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark appointment as completed"""
        appointment = self.get_object()
        
        if request.user != appointment.physiotherapist and not request.user.is_staff:
            return Response(
                {'error': 'Only the assigned physiotherapist can complete appointments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        appointment.status = 'completed'
        appointment.treatment_plan = request.data.get('treatment_plan', '')
        appointment.prescription = request.data.get('prescription', '')
        appointment.notes = request.data.get('notes', '')
        appointment.save()
        
        return Response({'message': 'Appointment completed successfully'})


class AppointmentFeedbackViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AppointmentFeedback model
    """
    queryset = AppointmentFeedback.objects.all()
    serializer_class = AppointmentFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['rating', 'would_recommend']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter feedback based on user role"""
        user = self.request.user
        if user.is_staff:
            return AppointmentFeedback.objects.all()
        elif user.user_type == 'patient':
            return AppointmentFeedback.objects.filter(appointment__patient=user)
        elif user.user_type == 'physiotherapist':
            return AppointmentFeedback.objects.filter(appointment__physiotherapist=user)
        return AppointmentFeedback.objects.none()


class AppointmentDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AppointmentDocument model
    """
    queryset = AppointmentDocument.objects.all()
    serializer_class = AppointmentDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['document_type', 'is_confidential']
    search_fields = ['title', 'appointment__patient__username']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter documents based on user permissions"""
        user = self.request.user
        if user.is_staff:
            return AppointmentDocument.objects.all()
        elif user.user_type == 'patient':
            return AppointmentDocument.objects.filter(appointment__patient=user)
        elif user.user_type == 'physiotherapist':
            return AppointmentDocument.objects.filter(appointment__physiotherapist=user)
        return AppointmentDocument.objects.none()


# ============================================================================
# EXERCISE MANAGEMENT VIEWS
# ============================================================================

class ExerciseCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ExerciseCategory model
    """
    queryset = ExerciseCategory.objects.filter(is_active=True).order_by('sort_order', 'name')
    serializer_class = ExerciseCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'sort_order', 'created_at']
    ordering = ['sort_order', 'name']


class ExerciseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Exercise model
    """
    queryset = Exercise.objects.filter(is_active=True)
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'difficulty']
    search_fields = ['name', 'description', 'instructions', 'benefits']
    ordering_fields = ['name', 'difficulty', 'duration', 'created_at']
    ordering = ['name']
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get exercises grouped by category"""
        category_id = request.query_params.get('category_id')
        if category_id:
            exercises = self.get_queryset().filter(category_id=category_id)
        else:
            exercises = self.get_queryset()
        
        serializer = self.get_serializer(exercises, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search_by_body_part(self, request):
        """Search exercises by body part"""
        body_part = request.query_params.get('body_part', '')
        if body_part:
            exercises = self.get_queryset().filter(
                target_body_parts__icontains=body_part
            )
            serializer = self.get_serializer(exercises, many=True)
            return Response(serializer.data)
        return Response([])


class ExercisePlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ExercisePlan model
    """
    queryset = ExercisePlan.objects.all()
    serializer_class = ExercisePlanSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientOrPhysiotherapist]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'frequency_per_week']
    search_fields = ['name', 'description', 'patient__username', 'physiotherapist__username']
    ordering_fields = ['created_at', 'start_date', 'end_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter plans based on user role"""
        user = self.request.user
        if user.is_staff:
            return ExercisePlan.objects.all()
        elif user.user_type == 'patient':
            return ExercisePlan.objects.filter(patient=user)
        elif user.user_type == 'physiotherapist':
            return ExercisePlan.objects.filter(physiotherapist=user)
        return ExercisePlan.objects.none()
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active exercise plans"""
        active_plans = self.get_queryset().filter(status='active')
        serializer = self.get_serializer(active_plans, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate an exercise plan"""
        plan = self.get_object()
        plan.status = 'active'
        plan.save()
        return Response({'message': 'Exercise plan activated'})
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete an exercise plan"""
        plan = self.get_object()
        plan.status = 'completed'
        plan.save()
        return Response({'message': 'Exercise plan completed'})


class ExercisePlanItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ExercisePlanItem model
    """
    queryset = ExercisePlanItem.objects.all()
    serializer_class = ExercisePlanItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientOrPhysiotherapist]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['day_of_week', 'week_number', 'is_mandatory']
    ordering_fields = ['day_of_week', 'week_number']
    ordering = ['week_number', 'day_of_week']
    
    def get_queryset(self):
        """Filter items based on user permissions"""
        user = self.request.user
        if user.is_staff:
            return ExercisePlanItem.objects.all()
        elif user.user_type == 'patient':
            return ExercisePlanItem.objects.filter(exercise_plan__patient=user)
        elif user.user_type == 'physiotherapist':
            return ExercisePlanItem.objects.filter(exercise_plan__physiotherapist=user)
        return ExercisePlanItem.objects.none()


class ExerciseProgressViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ExerciseProgress model
    """
    queryset = ExerciseProgress.objects.all()
    serializer_class = ExerciseProgressSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientOrPhysiotherapist]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['completion_status', 'difficulty_rating', 'date_completed']
    ordering_fields = ['date_completed', 'created_at']
    ordering = ['-date_completed']
    
    def get_queryset(self):
        """Filter progress based on user permissions"""
        user = self.request.user
        if user.is_staff:
            return ExerciseProgress.objects.all()
        elif user.user_type == 'patient':
            return ExerciseProgress.objects.filter(patient=user)
        elif user.user_type == 'physiotherapist':
            return ExerciseProgress.objects.filter(
                exercise_plan_item__exercise_plan__physiotherapist=user
            )
        return ExerciseProgress.objects.none()
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get exercise progress statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total_sessions': queryset.count(),
            'completed_sessions': queryset.filter(completion_status='completed').count(),
            'average_pain_improvement': queryset.aggregate(
                avg_improvement=Avg('pain_improvement')
            )['avg_improvement'] or 0,
            'average_difficulty_rating': queryset.aggregate(
                avg_difficulty=Avg('difficulty_rating')
            )['avg_difficulty'] or 0,
        }
        
        return Response(stats)


# ============================================================================
# NOTIFICATION VIEWS
# ============================================================================

class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Notification model
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['notification_type', 'is_read']
    ordering_fields = ['created_at', 'is_read']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter notifications for current user"""
        return Notification.objects.filter(recipient=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        unread = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(unread, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read'})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark specific notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for NotificationPreference model
    """
    queryset = NotificationPreference.objects.all()
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter preferences for current user"""
        return NotificationPreference.objects.filter(user=self.request.user)


# ============================================================================
# CHAT VIEWS
# ============================================================================

class ConversationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Conversation model
    """
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-updated_at']
    
    def get_queryset(self):
        """Filter conversations for current user"""
        return Conversation.objects.filter(participants=self.request.user)


class MessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Message model
    """
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['created_at']
    
    def get_queryset(self):
        """Filter messages for conversations user is part of"""
        return Message.objects.filter(
            conversation__participants=self.request.user
        )


class AttachmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Attachment model
    """
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter attachments for user's messages"""
        return Attachment.objects.filter(
            message__conversation__participants=self.request.user
        )


# Additional API Views for Enhanced Frontend Integration

from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard statistics for the current user
    """
    user = request.user
    today = timezone.now().date()
    
    if user.user_type == 'patient':
        # Patient dashboard stats
        upcoming_appointments = Appointment.objects.filter(
            patient=user,
            date__gte=today,
            status__in=['scheduled', 'confirmed']
        ).count()
        
        active_exercise_plans = ExercisePlan.objects.filter(
            patient=user,
            status='active'
        ).count()
        
        completed_exercises_today = ExerciseProgress.objects.filter(
            patient=user,
            date_completed=today
        ).count()
        
        total_progress_entries = ExerciseProgress.objects.filter(
            patient=user
        ).count()
        
        # Calculate exercise streak
        streak = calculate_exercise_streak(user)
        
        stats = {
            'upcoming_appointments': upcoming_appointments,
            'active_exercise_plans': active_exercise_plans,
            'completed_exercises_today': completed_exercises_today,
            'total_progress_entries': total_progress_entries,
            'exercise_streak': streak,
            'user_type': 'patient'
        }
        
    elif user.user_type == 'physiotherapist':
        # Physiotherapist dashboard stats
        today_appointments = Appointment.objects.filter(
            physiotherapist=user,
            date=today
        ).count()
        
        total_patients = Appointment.objects.filter(
            physiotherapist=user
        ).values('patient').distinct().count()
        
        pending_appointments = Appointment.objects.filter(
            physiotherapist=user,
            status='scheduled'
        ).count()
        
        active_exercise_plans = ExercisePlan.objects.filter(
            created_by=user,
            status='active'
        ).count()
        
        stats = {
            'today_appointments': today_appointments,
            'total_patients': total_patients,
            'pending_appointments': pending_appointments,
            'active_exercise_plans': active_exercise_plans,
            'user_type': 'physiotherapist'
        }
        
    else:
        # Admin dashboard stats
        total_users = User.objects.count()
        total_patients = User.objects.filter(user_type='patient').count()
        total_physiotherapists = User.objects.filter(user_type='physiotherapist').count()
        total_appointments = Appointment.objects.count()
        total_exercises = Exercise.objects.count()
        
        stats = {
            'total_users': total_users,
            'total_patients': total_patients,
            'total_physiotherapists': total_physiotherapists,
            'total_appointments': total_appointments,
            'total_exercises': total_exercises,
            'user_type': 'admin'
        }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_activity(request):
    """
    Get recent activity for the current user
    """
    user = request.user
    limit = int(request.GET.get('limit', 10))
    
    activities = []
    
    if user.user_type == 'patient':
        # Recent appointments
        recent_appointments = Appointment.objects.filter(
            patient=user
        ).order_by('-date', '-start_time')[:limit//2]
        
        for appointment in recent_appointments:
            activities.append({
                'type': 'appointment',
                'title': f'Appointment with {appointment.physiotherapist.get_full_name()}',
                'date': appointment.date,
                'time': appointment.start_time,
                'status': appointment.status,
                'id': appointment.id
            })
        
        # Recent exercise progress
        recent_progress = ExerciseProgress.objects.filter(
            patient=user
        ).order_by('-date_completed')[:limit//2]
        
        for progress in recent_progress:
            activities.append({
                'type': 'exercise',
                'title': f'Completed {progress.exercise_plan_item.exercise.name}',
                'date': progress.date_completed,
                'completion_status': progress.completion_status,
                'difficulty_rating': progress.difficulty_rating,
                'id': progress.id
            })
    
    elif user.user_type == 'physiotherapist':
        # Recent appointments
        recent_appointments = Appointment.objects.filter(
            physiotherapist=user
        ).order_by('-date', '-start_time')[:limit]
        
        for appointment in recent_appointments:
            activities.append({
                'type': 'appointment',
                'title': f'Appointment with {appointment.patient.get_full_name()}',
                'date': appointment.date,
                'time': appointment.start_time,
                'status': appointment.status,
                'id': appointment.id
            })
    
    # Sort activities by date
    activities.sort(key=lambda x: x['date'], reverse=True)
    
    return Response(activities[:limit])

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_time_slots(request):
    """
    Get available time slots for appointment booking
    """
    physiotherapist_id = request.GET.get('physiotherapist_id')
    date_str = request.GET.get('date')
    
    if not physiotherapist_id or not date_str:
        return Response(
            {'error': 'physiotherapist_id and date are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Try to get physiotherapist - if none exists, create a mock response
        try:
            physiotherapist = User.objects.get(id=physiotherapist_id, user_type='physiotherapist')
        except User.DoesNotExist:
            # For demo purposes, return available slots even if physiotherapist doesn't exist
            physiotherapist = None
        
        appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response(
            {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get existing appointments for the date
    if physiotherapist:
        existing_appointments = Appointment.objects.filter(
            physiotherapist=physiotherapist,
            date=appointment_date,
            status__in=['scheduled', 'confirmed']
        ).values_list('start_time', 'end_time')
    else:
        # For demo purposes, assume no existing appointments
        existing_appointments = []
    
    # Generate available time slots (9 AM to 5 PM, 1-hour slots)
    available_slots = []
    start_hour = 9
    end_hour = 17
    
    for hour in range(start_hour, end_hour):
        slot_start = f"{hour:02d}:00"
        slot_end = f"{hour+1:02d}:00"
        
        # Check if slot conflicts with existing appointments
        is_available = True
        for existing_start, existing_end in existing_appointments:
            if (slot_start >= str(existing_start) and slot_start < str(existing_end)) or \
               (slot_end > str(existing_start) and slot_end <= str(existing_end)):
                is_available = False
                break
        
        if is_available:
            available_slots.append({
                'start_time': slot_start,
                'end_time': slot_end,
                'display': f"{slot_start} - {slot_end}"
            })
    
    return Response(available_slots)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def exercise_analytics(request):
    """
    Get exercise analytics for the current user
    """
    user = request.user
    
    if user.user_type != 'patient':
        return Response(
            {'error': 'Only patients can view exercise analytics'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get date range
    days = int(request.GET.get('days', 30))
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)
    
    # Get exercise progress data
    progress_data = ExerciseProgress.objects.filter(
        patient=user,
        date_completed__gte=start_date,
        date_completed__lte=end_date
    ).order_by('date_completed')
    
    # Aggregate data by date
    daily_stats = {}
    for progress in progress_data:
        date_str = progress.date_completed.strftime('%Y-%m-%d')
        if date_str not in daily_stats:
            daily_stats[date_str] = {
                'date': date_str,
                'exercises_completed': 0,
                'total_duration': 0,
                'avg_difficulty': 0,
                'avg_pain_before': 0,
                'avg_pain_after': 0,
                'difficulties': [],
                'pain_before': [],
                'pain_after': []
            }
        
        daily_stats[date_str]['exercises_completed'] += 1
        daily_stats[date_str]['total_duration'] += progress.actual_duration
        daily_stats[date_str]['difficulties'].append(progress.difficulty_rating)
        daily_stats[date_str]['pain_before'].append(progress.pain_level_before)
        daily_stats[date_str]['pain_after'].append(progress.pain_level_after)
    
    # Calculate averages
    for date_str, stats in daily_stats.items():
        if stats['difficulties']:
            stats['avg_difficulty'] = sum(stats['difficulties']) / len(stats['difficulties'])
            stats['avg_pain_before'] = sum(stats['pain_before']) / len(stats['pain_before'])
            stats['avg_pain_after'] = sum(stats['pain_after']) / len(stats['pain_after'])
        
        # Remove raw lists
        del stats['difficulties']
        del stats['pain_before']
        del stats['pain_after']
    
    # Convert to list and sort by date
    analytics = list(daily_stats.values())
    analytics.sort(key=lambda x: x['date'])
    
    # Calculate summary stats
    total_exercises = sum(day['exercises_completed'] for day in analytics)
    total_duration = sum(day['total_duration'] for day in analytics)
    avg_exercises_per_day = total_exercises / max(len(analytics), 1)
    
    summary = {
        'total_exercises': total_exercises,
        'total_duration': total_duration,
        'avg_exercises_per_day': round(avg_exercises_per_day, 1),
        'days_with_activity': len(analytics),
        'streak': calculate_exercise_streak(user)
    }
    
    return Response({
        'summary': summary,
        'daily_data': analytics
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_global(request):
    """
    Global search across multiple models
    """
    query = request.GET.get('q', '').strip()
    if not query:
        return Response({'results': []})
    
    user = request.user
    results = []
    
    # Search appointments
    appointments = Appointment.objects.filter(
        Q(patient=user) | Q(physiotherapist=user),
        Q(notes__icontains=query) | Q(status__icontains=query)
    )[:5]
    
    for appointment in appointments:
        results.append({
            'type': 'appointment',
            'id': appointment.id,
            'title': f'Appointment on {appointment.date}',
            'description': f'With {appointment.physiotherapist.get_full_name() if user.user_type == "patient" else appointment.patient.get_full_name()}',
            'url': f'/appointments/{appointment.id}/'
        })
    
    # Search exercises
    exercises = Exercise.objects.filter(
        Q(name__icontains=query) | Q(description__icontains=query)
    )[:5]
    
    for exercise in exercises:
        results.append({
            'type': 'exercise',
            'id': exercise.id,
            'title': exercise.name,
            'description': exercise.description[:100] + '...' if len(exercise.description) > 100 else exercise.description,
            'url': f'/exercises/{exercise.id}/'
        })
    
    # Search users (for physiotherapists and admins)
    if user.user_type in ['physiotherapist', 'admin']:
        users = User.objects.filter(
            Q(first_name__icontains=query) | Q(last_name__icontains=query) | Q(email__icontains=query)
        ).exclude(id=user.id)[:5]
        
        for user_obj in users:
            results.append({
                'type': 'user',
                'id': user_obj.id,
                'title': user_obj.get_full_name(),
                'description': f'{user_obj.user_type.title()} - {user_obj.email}',
                'url': f'/users/{user_obj.id}/'
            })
    
    return Response({'results': results})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def quick_actions(request):
    """
    Handle quick actions from the frontend
    """
    action = request.data.get('action')
    
    if action == 'mark_all_notifications_read':
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'success': True, 'message': 'All notifications marked as read'})
    
    elif action == 'get_unread_count':
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({'unread_count': count})
    
    elif action == 'cancel_appointment':
        appointment_id = request.data.get('appointment_id')
        reason = request.data.get('reason', '')
        
        try:
            appointment = Appointment.objects.get(
                Q(id=appointment_id) & (Q(patient=request.user) | Q(physiotherapist=request.user))
            )
            appointment.status = 'cancelled'
            appointment.cancellation_reason = reason
            appointment.save()
            
            return Response({'success': True, 'message': 'Appointment cancelled successfully'})
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

def calculate_exercise_streak(user):
    """
    Calculate the current exercise streak for a user
    """
    today = timezone.now().date()
    streak = 0
    current_date = today
    
    while True:
        has_exercise = ExerciseProgress.objects.filter(
            patient=user,
            date_completed=current_date
        ).exists()
        
        if has_exercise:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break
        
        # Prevent infinite loop
        if streak > 365:
            break
    
    return streak

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def health_check(request):
    """
    Health check endpoint for monitoring
    """
    try:
        # Check database connection
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return Response({
        'status': 'healthy' if db_status == 'healthy' else 'unhealthy',
        'timestamp': timezone.now(),
        'database': db_status,
        'user': request.user.username,
        'version': '1.0.0'
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def pain_analytics(request):
    """Get pain tracking analytics"""
    days = int(request.GET.get('days', 30))
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)
    
    # Mock pain data for now - replace with actual pain tracking model
    pain_data = {
        'summary': {
            'average_pain_level': 4.2,
            'pain_free_days': 8,
            'high_pain_days': 3,
            'improvement_trend': 'improving',
            'most_common_area': 'lower_back'
        },
        'daily_data': [
            {
                'date': (start_date + timedelta(days=i)).isoformat(),
                'pain_level': max(0, min(10, 5 + (i % 7 - 3))),
                'affected_areas': ['lower_back', 'neck'] if i % 3 == 0 else ['lower_back']
            }
            for i in range(days)
        ]
    }
    
    return Response(pain_data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def progress_analytics(request):
    """Get progress analytics"""
    days = int(request.GET.get('days', 30))
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)
    
    # Get actual progress data
    progress_entries = ExerciseProgress.objects.filter(
        patient=request.user,
        date_completed__gte=start_date,
        date_completed__lte=end_date
    ).order_by('date_completed')
    
    # Calculate analytics
    total_sessions = progress_entries.count()
    completed_exercises = progress_entries.filter(completion_status='completed').count()
    completion_rate = (completed_exercises / total_sessions * 100) if total_sessions > 0 else 0
    
    # Group by date for daily progress
    daily_progress = {}
    for entry in progress_entries:
        date_str = entry.date_completed.isoformat()
        if date_str not in daily_progress:
            daily_progress[date_str] = {
                'date': date_str,
                'total_exercises': 0,
                'completed_exercises': 0,
                'total_duration': 0,
                'average_difficulty': 0
            }
        
        daily_progress[date_str]['total_exercises'] += 1
        if entry.completion_status == 'completed':
            daily_progress[date_str]['completed_exercises'] += 1
        daily_progress[date_str]['total_duration'] += entry.actual_duration or 0
        daily_progress[date_str]['average_difficulty'] += entry.difficulty_rating or 0
    
    # Calculate averages
    for day_data in daily_progress.values():
        if day_data['total_exercises'] > 0:
            day_data['average_difficulty'] = day_data['average_difficulty'] / day_data['total_exercises']
    
    analytics_data = {
        'summary': {
            'total_sessions': total_sessions,
            'completed_exercises': completed_exercises,
            'completion_rate': round(completion_rate, 1),
            'average_session_duration': round(
                sum(entry.actual_duration or 0 for entry in progress_entries) / total_sessions, 1
            ) if total_sessions > 0 else 0,
            'streak_days': calculate_exercise_streak(request.user)
        },
        'daily_data': list(daily_progress.values())
    }
    
    return Response(analytics_data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_notification_count(request):
    """Get unread notification count"""
    from notifications.models import Notification
    
    unread_count = Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).count()
    
    return Response({
        'unread_count': unread_count
    })