# Healthcare Management System - API Endpoints

## Overview
This document describes the comprehensive API endpoints available for the Healthcare Management System frontend. The API provides both standard CRUD operations and specialized endpoints for enhanced user experience.

## Base URL
- **Development**: `http://localhost:12000/api/`
- **Production**: Update as needed

## Authentication
All endpoints require authentication using Token-based authentication.

### Get Authentication Token
```http
POST /api/auth/token/
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "your_auth_token_here"
}
```

### Using the Token
Include the token in the Authorization header:
```http
Authorization: Token your_auth_token_here
```

## Standard CRUD Endpoints

### Users & Authentication
- `GET /api/users/` - List users
- `POST /api/users/` - Create user
- `GET /api/users/{id}/` - Get user details
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user
- `GET /api/patient-profiles/` - List patient profiles
- `GET /api/physiotherapist-profiles/` - List physiotherapist profiles

### Appointments
- `GET /api/appointments/` - List appointments
- `POST /api/appointments/` - Create appointment
- `GET /api/appointments/{id}/` - Get appointment details
- `PUT /api/appointments/{id}/` - Update appointment
- `DELETE /api/appointments/{id}/` - Delete appointment
- `GET /api/appointment-feedback/` - List appointment feedback
- `GET /api/appointment-documents/` - List appointment documents

### Exercises
- `GET /api/exercise-categories/` - List exercise categories
- `GET /api/exercises/` - List exercises
- `POST /api/exercises/` - Create exercise
- `GET /api/exercise-plans/` - List exercise plans
- `POST /api/exercise-plans/` - Create exercise plan
- `GET /api/exercise-progress/` - List exercise progress
- `POST /api/exercise-progress/` - Log exercise progress

### Notifications
- `GET /api/notifications/` - List notifications
- `POST /api/notifications/` - Create notification
- `PUT /api/notifications/{id}/` - Update notification
- `GET /api/notification-preferences/` - Get notification preferences

### Chat & Messaging
- `GET /api/conversations/` - List conversations
- `POST /api/conversations/` - Create conversation
- `GET /api/messages/` - List messages
- `POST /api/messages/` - Send message
- `GET /api/attachments/` - List attachments

## Enhanced Frontend Endpoints

### Dashboard & Analytics

#### Dashboard Statistics
```http
GET /api/dashboard/stats/
```

**Response for Patient:**
```json
{
  "upcoming_appointments": 3,
  "active_exercise_plans": 2,
  "completed_exercises_today": 5,
  "total_progress_entries": 45,
  "exercise_streak": 7,
  "user_type": "patient"
}
```

**Response for Physiotherapist:**
```json
{
  "today_appointments": 8,
  "total_patients": 25,
  "pending_appointments": 3,
  "active_exercise_plans": 15,
  "user_type": "physiotherapist"
}
```

#### Recent Activity
```http
GET /api/dashboard/activity/?limit=10
```

**Response:**
```json
[
  {
    "type": "appointment",
    "title": "Appointment with Dr. Smith",
    "date": "2025-07-02",
    "time": "14:00:00",
    "status": "confirmed",
    "id": 123
  },
  {
    "type": "exercise",
    "title": "Completed Shoulder Stretch",
    "date": "2025-07-02",
    "completion_status": "completed",
    "difficulty_rating": 3,
    "id": 456
  }
]
```

#### Exercise Analytics
```http
GET /api/analytics/exercises/?days=30
```

**Response:**
```json
{
  "summary": {
    "total_exercises": 45,
    "total_duration": 1200,
    "avg_exercises_per_day": 1.5,
    "days_with_activity": 20,
    "streak": 7
  },
  "daily_data": [
    {
      "date": "2025-07-01",
      "exercises_completed": 3,
      "total_duration": 45,
      "avg_difficulty": 2.5,
      "avg_pain_before": 4.0,
      "avg_pain_after": 2.0
    }
  ]
}
```

### Appointment Management

#### Available Time Slots
```http
GET /api/appointments/available-slots/?physiotherapist_id=123&date=2025-07-03
```

**Response:**
```json
[
  {
    "start_time": "09:00",
    "end_time": "10:00",
    "display": "09:00 - 10:00"
  },
  {
    "start_time": "11:00",
    "end_time": "12:00",
    "display": "11:00 - 12:00"
  }
]
```

### Search & Discovery

#### Global Search
```http
GET /api/search/?q=shoulder
```

**Response:**
```json
{
  "results": [
    {
      "type": "exercise",
      "id": 123,
      "title": "Shoulder Stretch",
      "description": "A gentle shoulder stretching exercise...",
      "url": "/exercises/123/"
    },
    {
      "type": "appointment",
      "id": 456,
      "title": "Appointment on 2025-07-03",
      "description": "With Dr. Smith",
      "url": "/appointments/456/"
    }
  ]
}
```

### Quick Actions

#### Notification Management
```http
POST /api/actions/
Content-Type: application/json

{
  "action": "mark_all_notifications_read"
}
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

#### Get Unread Notification Count
```http
POST /api/actions/
Content-Type: application/json

{
  "action": "get_unread_count"
}
```

**Response:**
```json
{
  "unread_count": 5
}
```

#### Quick Appointment Cancellation
```http
POST /api/actions/
Content-Type: application/json

{
  "action": "cancel_appointment",
  "appointment_id": 123,
  "reason": "Emergency came up"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

### System Health

#### Health Check
```http
GET /api/health/
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-02T16:42:08.827650Z",
  "user": "admin",
  "version": "1.0.0"
}
```

## Frontend API Service Usage

The frontend includes an enhanced API service (`src/services/api.js`) with methods for all endpoints:

### Basic Usage
```javascript
import apiService from '@/services/api';

// Get dashboard data
const dashboardData = await apiService.getDashboardData();

// Search globally
const searchResults = await apiService.searchGlobal('shoulder');

// Book appointment with availability check
const appointment = await apiService.bookAppointment({
  physiotherapist: 123,
  date: '2025-07-03',
  start_time: '09:00',
  end_time: '10:00'
});

// Log exercise session
const progress = await apiService.logExerciseSession(456, {
  completion_status: 'completed',
  difficulty_rating: 3,
  pain_level_before: 4,
  pain_level_after: 2,
  actual_duration: 15
});
```

### Enhanced Features
```javascript
// Search with caching
const results = await apiService.searchWithCache('query', 30000);

// Quick actions
await apiService.markAllNotificationsRead();
const unreadCount = await apiService.getUnreadNotificationCount();
await apiService.cancelAppointmentQuick(123, 'Emergency');

// Get exercise analytics
const analytics = await apiService.getExerciseAnalytics(30);
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses include details:
```json
{
  "error": "Error message",
  "details": "Additional error details if available"
}
```

## Rate Limiting & Performance

- API responses are optimized for frontend consumption
- Search results are limited to prevent performance issues
- Caching is implemented in the frontend service layer
- Pagination is available for list endpoints

## Security Considerations

- All endpoints require authentication
- User data is filtered based on permissions
- Sensitive operations require appropriate user roles
- CORS is configured for frontend domains

## Development & Testing

### Running the Backend
```bash
cd healthcare_backend
USE_SQLITE=true python manage.py runserver 0.0.0.0:12000
```

### Testing Endpoints
```bash
python test_endpoints.py
```

### Frontend Development
```bash
npm run dev -- --host 0.0.0.0 --port 12001
```

## Support & Documentation

For additional support or questions about the API:
1. Check the Django admin interface at `/admin/`
2. Review the API source code in `api_views.py`
3. Test endpoints using the provided test script
4. Refer to the frontend service implementation for usage examples