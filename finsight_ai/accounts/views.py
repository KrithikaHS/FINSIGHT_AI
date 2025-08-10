from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from .Serializers import SignupSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework_simplejwt.views import TokenObtainPairView
from .Serializers import MyTokenObtainPairSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    print("View received data:", request.data)
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Signup successful"}, status=status.HTTP_201_CREATED)
    else:
        print("Serializer errors:", serializer.errors)  # Debug print validation errors
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Expense
from .Serializers import ExpenseSerializer

class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Expense.objects.filter(user=user)

        # Filtering (optional): by date range, category, etc.
        from_date = self.request.query_params.get('from')
        to_date = self.request.query_params.get('to')
        category = self.request.query_params.get('category')

        if from_date:
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            queryset = queryset.filter(date__lte=to_date)
        if category:
            queryset = queryset.filter(category__iexact=category)

        return queryset.order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract
import re
from datetime import datetime
from .models import Expense  # Adjust import to your project structure

class ReceiptUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        file_obj = request.FILES.get('receipt')
        print("Tesseract executable:", pytesseract.pytesseract.tesseract_cmd)

        if not file_obj:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            filename = file_obj.name.lower()
            print("Received file:", filename)

            if filename.endswith(('.png', '.jpg', '.jpeg')):
                # Image preprocessing to improve OCR accuracy
                file_obj.seek(0)
                image = Image.open(file_obj).convert('L')  # convert to grayscale
                
                # Enhance contrast
                enhancer = ImageEnhance.Contrast(image)
                image = enhancer.enhance(2)

                # Resize to double size
                new_size = (image.width * 2, image.height * 2)
                image = image.resize(new_size)

                # Thresholding (binarization)
                image = image.point(lambda x: 0 if x < 140 else 255, '1')

                # Denoise filter
                image = image.filter(ImageFilter.MedianFilter())

                # Set Tesseract executable path (adjust if needed)
                pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

                # OCR extraction
                text = pytesseract.image_to_string(image)

            elif filename.endswith('.txt'):
                text = file_obj.read().decode('utf-8')
            else:
                return Response({"error": "Unsupported file type"}, status=status.HTTP_400_BAD_REQUEST)

            print("Extracted OCR Text:\n", text)

            # Fix common OCR errors - example fix for date typo like 2025-068-02 -> 2025-08-02
            text = re.sub(r'(\d{4})-0?6?8-(\d{2})', r'\1-08-\2', text)

            # Extract amount - looks for lines like 'Total Amount: %1,250.75' or just numbers with optional symbols
            amount_match = re.search(r'Total Amount:\s*[%$]?\s*([\d,]+\.?\d*)', text, re.IGNORECASE)
            if not amount_match:
                # fallback: first number found
                amount_match = re.search(r'(\d+[.,]?\d*)', text)
            amount = 0.0
            if amount_match:
                amount_str = amount_match.group(1).replace(',', '')
                try:
                    amount = float(amount_str)
                except:
                    amount = 0.0

            # Extract date (support multiple formats)
            date_match = re.search(r'Date:\s*([\d\-\/]+)', text, re.IGNORECASE)
            date = None
            if date_match:
                date_str = date_match.group(1)
                for fmt in ('%Y-%m-%d', '%Y-%d-%m', '%d/%m/%Y'):
                    try:
                        date = datetime.strptime(date_str, fmt).date()
                        break
                    except ValueError:
                        continue

            # Extract merchant (first non-empty line)
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            merchant = lines[0] if lines else "Unknown"

            # Extract category
            category_match = re.search(r'Category:\s*(.+)', text, re.IGNORECASE)
            category = category_match.group(1).strip() if category_match else "Misc"

            # Create expense record
            expense = Expense.objects.create(
                user=request.user,
                title=f"Expense - {merchant}",
                amount=amount,
                category=category,
                merchant=merchant,
                date=date or datetime.today().date()
            )

            print("Expense created:", expense)

            # Return parsed data for frontend autofill
            return Response({
                "parsed": {
                    "amount": amount,
                    "date": date.isoformat() if date else "",
                    "merchant": merchant,
                    "category": category,
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print("Exception occurred:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date, timedelta
from django.db.models import Sum, F
from accounts.models import Expense  # Adjust import as needed

class ForecastView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = int(request.query_params.get('period', 30))
        user = request.user

        # Example logic: Return daily expense sums for the last `period` days + a simple forecast (e.g., moving average)

        end_date = date.today()
        start_date = end_date - timedelta(days=period-1)

        # Aggregate actual expenses per day
        expenses_qs = (
            Expense.objects.filter(user=user, date__range=[start_date, end_date])
            .values('date')
            .annotate(total=Sum('amount'))
            .order_by('date')
        )

        # Prepare data dict with all dates in period initialized to 0
        date_list = [(start_date + timedelta(days=i)) for i in range(period)]
        actual_dict = {d: 0 for d in date_list}

        for entry in expenses_qs:
            actual_dict[entry['date']] = float(entry['total'])

        actual = [actual_dict[d] for d in date_list]
        dates = [d.isoformat() for d in date_list]

        # Simple forecast: moving average of last 7 days, or just repeat actual for demo
        forecast = []
        window_size = 7
        for i in range(period):
            if i < window_size:
                avg = sum(actual[:i+1]) / (i+1)
            else:
                avg = sum(actual[i-window_size+1:i+1]) / window_size
            forecast.append(round(avg, 2))

        return Response({
            "dates": dates,
            "actual": actual,
            "forecast": forecast
        })


class TrendsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = int(request.query_params.get('period', 30))
        user = request.user

        end_date = date.today()
        start_date = end_date - timedelta(days=period)

        # Aggregate sums by category for current period
        current_data = (
            Expense.objects.filter(user=user, date__range=[start_date, end_date])
            .values('category')
            .annotate(total=Sum('amount'))
        )

        # Aggregate sums by category for previous period (for comparison)
        prev_start = start_date - timedelta(days=period)
        prev_end = start_date - timedelta(days=1)
        prev_data = (
            Expense.objects.filter(user=user, date__range=[prev_start, prev_end])
            .values('category')
            .annotate(total=Sum('amount'))
        )

        prev_totals = {entry['category']: entry['total'] for entry in prev_data}
        trends = []

        for entry in current_data:
            category = entry['category']
            current_total = entry['total'] or 0
            prev_total = prev_totals.get(category, 0) or 0
            if prev_total == 0:
                change = 100 if current_total > 0 else 0
            else:
                change = ((current_total - prev_total) / prev_total) * 100
            trends.append({
                "category": category,
                "change": round(change, 2)
            })

        # Sort by largest positive change
        trends = sorted(trends, key=lambda x: x['change'], reverse=True)

        return Response({
            "topCategories": trends
        })
    
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Expense, Alert, Recommendation

class RecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        expenses = Expense.objects.filter(user=user)

        # Clear old recommendations
        Recommendation.objects.filter(user=user).delete()

        # Simple logic: check if monthly subscriptions > 1000
        subs_expenses = expenses.filter(category__iexact="subscriptions")
        total_subs = sum(e.amount for e in subs_expenses)

        recs = []
        if total_subs > 100:
            rec_text = "Move subscription payments to annual to save 10%"
            recs.append(rec_text)
            Recommendation.objects.create(user=user, text=rec_text)

        # Example: if grocery expenses trending up (last month vs previous)
        from django.utils.timezone import now
        from datetime import timedelta

        today = now().date()
        last_month_start = today - timedelta(days=30)
        prev_month_start = today - timedelta(days=60)
        prev_month_end = last_month_start - timedelta(days=1)

        last_month_grocery = expenses.filter(category__iexact="food", date__gte=last_month_start)
        prev_month_grocery = expenses.filter(category__iexact="food", date__range=[prev_month_start, prev_month_end])

        if last_month_grocery and prev_month_grocery:
            last_sum = sum(e.amount for e in last_month_grocery)
            prev_sum = sum(e.amount for e in prev_month_grocery)
            if last_sum > prev_sum * 1.1:  # more than 10% increase
                rec_text = "Grocery spending trending up — try a 10% budget cut"
                recs.append(rec_text)
                Recommendation.objects.create(user=user, text=rec_text)

        # Return all recommendations from DB
        rec_objs = Recommendation.objects.filter(user=user)
        rec_data = [{"id": r.id, "text": r.text} for r in rec_objs]

        return Response(rec_data)


class AlertView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Clear old alerts if needed, or keep history
        # For demo, generate alerts dynamically:

        alerts = []

        expenses = Expense.objects.filter(user=user)
        print(expenses)
        total_grocery = sum(e.amount for e in expenses.filter(category__iexact="food"))
        # Example budget set to 10000
        print(total_grocery)
        budget = 100
        if total_grocery > budget * 0.9:
            alerts.append({"id": 1, "text": f"Spent {int((total_grocery/budget)*100)}% of monthly grocery budget"})
        print(alerts)
        large_txns = expenses.filter(amount__gte=10000)
        for i, txn in enumerate(large_txns, start=2):
            alerts.append({"id": i, "text": f"Unusual large transaction: ₹ {txn.amount} at {txn.merchant}"})
        print(alerts)
        return Response(alerts)


# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date, timedelta
from django.db.models import Sum
from .models import Expense

class HeatmapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        days = 35
        end_date = date.today()
        start_date = end_date - timedelta(days=days - 1)

        # Get total spend per day in date range for user
        expenses = (
            Expense.objects.filter(user=user, date__range=[start_date, end_date])
            .values('date')
            .annotate(total=Sum('amount'))
            .order_by('date')
        )

        # Create dict with default 0 spend for each day
        daily_spend = {start_date + timedelta(days=i): 0 for i in range(days)}

        for expense in expenses:
            daily_spend[expense['date']] = float(expense['total'])

        # Return list of spend amounts in date order
        spend_list = [daily_spend[start_date + timedelta(days=i)] for i in range(days)]
        print("HeatMap called")
        print(spend_list)
        return Response(spend_list)


from rest_framework import generics, permissions
from .models import RecurringExpense
from .Serializers import RecurringExpenseSerializer

class RecurringExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = RecurringExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RecurringExpense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RecurringExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RecurringExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return RecurringExpense.objects.filter(user=self.request.user)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from .models import Expense

class CategoryAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = (
            Expense.objects.filter(user=user)
            .values('category')
            .annotate(total_amount=Sum('amount'))
            .order_by('-total_amount')
        )
        print("Chart")
        print(data)
        return Response(data)
    
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from .models import Expense

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top_expenses(request):
    """
    Returns top 5 spending categories with total spend.
    """
    top_data = (
        Expense.objects.filter(user=request.user)
        .values("category")
        .annotate(total_amount=Sum("amount"))
        .order_by("-total_amount")[:5]
    )

    return Response(top_data)

