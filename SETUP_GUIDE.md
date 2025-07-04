# Rapha Healthcare Management System - Setup Guide

This guide provides detailed instructions for setting up the Rapha Healthcare Management System, a comprehensive platform for managing healthcare services, appointments, and patient-physiotherapist interactions.

## System Requirements

- **Operating System**: Linux, macOS, or Windows
- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher
- **PostgreSQL**: 12.0 or higher
- **Disk Space**: At least 1GB of free space

## Automated Setup

The easiest way to set up the system is to use the provided setup script:

```bash
# Make the script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

The setup script will:
1. Check for required dependencies (Python, Node.js, PostgreSQL)
2. Install PostgreSQL if not already installed
3. Create the PostgreSQL database and user
4. Set up the Django backend with proper environment configuration
5. Set up the React frontend with proper environment configuration
6. Create start scripts for both backend and frontend

## Manual Setup

If you prefer to set up the system manually, follow these steps:

### 1. PostgreSQL Setup

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo service postgresql start

# Create database and user
sudo -u postgres psql -c "CREATE USER healthcare_user WITH PASSWORD 'healthcare_password';"
sudo -u postgres psql -c "CREATE DATABASE healthcare_db OWNER healthcare_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE healthcare_db TO healthcare_user;"
```

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd healthcare_backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOL
# Django Settings
SECRET_KEY=django-insecure-local-development-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database Configuration
DB_NAME=healthcare_db
DB_USER=healthcare_user
DB_PASSWORD=healthcare_password
DB_HOST=localhost
DB_PORT=5432

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:12001,http://127.0.0.1:12001

# API Settings
API_BASE_URL=http://localhost:12000
EOL

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load sample data
python create_sample_data.py
```

### 3. Frontend Setup

```bash
# Navigate to the project root
cd ..

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
# API Configuration
VITE_API_BASE_URL=http://localhost:12000/api
VITE_API_TIMEOUT=10000

# Application Information
VITE_APP_NAME=Healthcare Management System
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Comprehensive healthcare management platform

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CHAT=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_EXERCISE_TRACKING=true

# Development Settings
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug

# Frontend URLs
VITE_FRONTEND_URL=http://localhost:12001
VITE_BACKEND_URL=http://localhost:12000

# Authentication Configuration
VITE_TOKEN_STORAGE_KEY=healthcare_auth_token
VITE_USER_STORAGE_KEY=healthcare_user_data
EOL

# Update Vite configuration
cat > vite.config.ts << EOL
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 12001,
    host: '0.0.0.0',
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
})
EOL
```

## Running the Application

### Starting the Backend

```bash
# Navigate to the backend directory
cd healthcare_backend

# Activate the virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start the Django server
python manage.py runserver 0.0.0.0:12000
```

### Starting the Frontend

```bash
# Navigate to the project root
cd ..

# Start the Vite development server
npm run dev
```

## Accessing the Application

- **Backend API**: http://localhost:12000
- **Frontend Application**: http://localhost:12001
- **Admin Interface**: http://localhost:12000/admin

## Test Accounts

The system comes with pre-configured test accounts:

- **Admin User**:
  - Username: admin
  - Password: admin123

- **Patient**:
  - Username: patient1
  - Password: password123

- **Physiotherapist**:
  - Username: physio1
  - Password: password123

## API Documentation

The API documentation is available at:
- http://localhost:12000/api/docs/

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify PostgreSQL is running:
   ```bash
   sudo service postgresql status
   ```

2. Check database credentials in `.env` file

3. Try using SQLite for development by uncommenting the `USE_SQLITE=true` line in the backend `.env` file

### Frontend Connection Issues

If the frontend cannot connect to the backend:

1. Verify the backend server is running
2. Check CORS settings in the backend `.env` file
3. Verify API base URL in the frontend `.env` file

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite Documentation](https://vitejs.dev/guide/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)