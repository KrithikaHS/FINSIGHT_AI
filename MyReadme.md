# Create Project & Virtual Environment

# Create virtual environment
python -m venv venv
venv\Scripts\activate 

# Install Django & DRF
pip install django djangorestframework djangorestframework-simplejwt

# Create Django project
django-admin startproject finsight_ai

cd finsight_ai

# Create accounts app
python manage.py startapp accounts

# Add to settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'accounts',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}


# Migrate & test
python manage.py makemigrations
python manage.py migrate

# Run server
python manage.py runserver

# React App
npx create-react-app finsight-ai-frontend
cd finsight-ai-frontend
npm start

