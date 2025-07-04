#!/bin/bash

# Healthcare Application Setup Script
# This script automates the local setup process

echo "🏥 Healthcare Application Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Python is installed
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
    else
        print_error "Python is not installed. Please install Python 3.8+ and try again."
        exit 1
    fi
    
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2)
    print_status "Found Python $PYTHON_VERSION"
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Found Node.js $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 16+ and try again."
        exit 1
    fi
}

# Check if PostgreSQL is installed
check_postgresql() {
    print_step "Checking PostgreSQL..."
    
    if command -v psql &> /dev/null; then
        PSQL_VERSION=$(psql --version | head -n 1)
        print_status "Found PostgreSQL: $PSQL_VERSION"
    else
        print_warning "PostgreSQL is not installed. Will attempt to install..."
        if command -v apt-get &> /dev/null; then
            print_status "Installing PostgreSQL using apt..."
            sudo apt-get update
            sudo apt-get install -y postgresql postgresql-contrib
        elif command -v yum &> /dev/null; then
            print_status "Installing PostgreSQL using yum..."
            sudo yum install -y postgresql postgresql-server
            sudo postgresql-setup initdb
            sudo systemctl start postgresql
        else
            print_error "Could not install PostgreSQL automatically. Please install PostgreSQL manually."
            exit 1
        fi
    fi
    
    # Start PostgreSQL service if not running
    if command -v systemctl &> /dev/null; then
        if ! systemctl is-active --quiet postgresql; then
            print_status "Starting PostgreSQL service..."
            sudo systemctl start postgresql
        fi
    elif command -v service &> /dev/null; then
        print_status "Starting PostgreSQL service..."
        sudo service postgresql start
    fi
}

# Setup PostgreSQL database
setup_postgresql() {
    print_step "Setting up PostgreSQL database..."
    
    # Create PostgreSQL user and database
    print_status "Creating PostgreSQL user and database..."
    sudo -u postgres psql -c "CREATE USER healthcare_user WITH PASSWORD 'healthcare_password';" || print_warning "User already exists"
    sudo -u postgres psql -c "CREATE DATABASE healthcare_db OWNER healthcare_user;" || print_warning "Database already exists"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE healthcare_db TO healthcare_user;"
    
    print_status "PostgreSQL database setup complete!"
}

# Setup backend
setup_backend() {
    print_step "Setting up Django backend..."
    
    cd healthcare_backend || exit 1
    
    # Create virtual environment
    print_status "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
    
    # Activate virtual environment
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file..."
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

# Use SQLite for development if PostgreSQL is not available
# USE_SQLITE=true

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:12001,http://127.0.0.1:12001

# API Settings
API_BASE_URL=http://localhost:12000
EOL
    fi
    
    # Run migrations
    print_status "Running database migrations..."
    $PYTHON_CMD manage.py makemigrations
    $PYTHON_CMD manage.py migrate
    
    # Create superuser if it doesn't exist
    print_status "Creating admin superuser..."
    $PYTHON_CMD manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123', first_name='Admin', last_name='User', user_type='admin')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
"
    
    # Create sample data
    print_status "Creating sample data..."
    $PYTHON_CMD create_sample_data.py
    
    print_status "Backend setup complete!"
    cd ..
}

# Setup frontend
setup_frontend() {
    print_step "Setting up React frontend..."
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating frontend .env file..."
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

# Upload Configuration
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,text/plain
EOL
    fi
    
    # Update vite.config.ts
    print_status "Updating Vite configuration..."
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
    
    print_status "Frontend setup complete!"
}

# Create start scripts
create_start_scripts() {
    print_step "Creating start scripts..."
    
    # Backend start script
    cat > start_backend.sh << 'EOL'
#!/bin/bash
echo "Starting Healthcare Backend..."
cd healthcare_backend
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi
python manage.py runserver 0.0.0.0:12000
EOL
    
    # Frontend start script
    cat > start_frontend.sh << 'EOL'
#!/bin/bash
echo "Starting Healthcare Frontend..."
npm run dev
EOL
    
    # Make scripts executable
    chmod +x start_backend.sh
    chmod +x start_frontend.sh
    
    # Windows batch files
    cat > start_backend.bat << 'EOL'
@echo off
echo Starting Healthcare Backend...
cd healthcare_backend
call venv\Scripts\activate
python manage.py runserver 0.0.0.0:12000
pause
EOL
    
    cat > start_frontend.bat << 'EOL'
@echo off
echo Starting Healthcare Frontend...
npm run dev
pause
EOL
    
    print_status "Start scripts created!"
}

# Main setup function
main() {
    print_step "Starting Healthcare Application Setup..."
    
    # Check prerequisites
    check_python
    check_node
    check_postgresql
    
    # Setup PostgreSQL
    setup_postgresql
    
    # Setup backend
    setup_backend
    
    # Setup frontend
    setup_frontend
    
    # Create start scripts
    create_start_scripts
    
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    echo "To start the application:"
    echo ""
    echo "1. Start the backend server:"
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        echo "   ./start_backend.bat"
    else
        echo "   ./start_backend.sh"
    fi
    echo "   Backend will be available at: http://localhost:12000"
    echo ""
    echo "2. In a new terminal, start the frontend:"
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        echo "   ./start_frontend.bat"
    else
        echo "   ./start_frontend.sh"
    fi
    echo "   Frontend will be available at: http://localhost:12001"
    echo ""
    echo "Test accounts:"
    echo "- Patient: patient1 / password123"
    echo "- Physiotherapist: physio1 / password123"
    echo "- Admin: admin / admin123"
    echo ""
    echo "Database Configuration:"
    echo "- Database: healthcare_db"
    echo "- Username: healthcare_user"
    echo "- Password: healthcare_password"
    echo ""
    echo "For detailed instructions, see: LOCAL_SETUP_GUIDE.md"
}

# Run main function
main "$@"