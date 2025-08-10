from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class SignupSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False)  # make optional

    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        print("Serializer received data before fix:", data)
        # If username not provided, set it to email BEFORE validation
        if not data.get('username') and data.get('email'):
            data['username'] = data['email']
        print("Serializer received data after fix:", data)
        return data

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', "")
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        token['first_name'] = user.first_name
        print(token)
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add extra responses here
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
        }
        return data
    
from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

from rest_framework import serializers
from .models import Recommendation, Alert

class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = "__all__"

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = "__all__"

from rest_framework import serializers
from .models import RecurringExpense

class RecurringExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringExpense
        fields = '__all__'
        read_only_fields = ['user', 'last_generated']

