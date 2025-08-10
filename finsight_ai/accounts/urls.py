from django.contrib import admin
from django.urls import path
from accounts.views import signup
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import ExpenseListCreateView, ExpenseDetailView, ReceiptUploadView
from .views import ForecastView, TrendsView
from .views import RecommendationView, AlertView, HeatmapView
from .views import RecurringExpenseListCreateView, RecurringExpenseDetailView
from .views import CategoryAnalyticsView,top_expenses


urlpatterns = [
    path('admin/', admin.site.urls),
    path('signup/', signup, name="signup"),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('expenses/', ExpenseListCreateView.as_view(), name='expenses-list-create'),
    path('expenses/<int:id>/', ExpenseDetailView.as_view(), name='expense-detail'),
    path('expenses/receipt-upload/', ReceiptUploadView.as_view(), name='receipt-upload'),
    path('analytics/forecast/', ForecastView.as_view(), name='forecast'),
    path('analytics/trends/', TrendsView.as_view(), name='trends'),
    path("recommendations/", RecommendationView.as_view(), name="recommendations"),
    path("alerts/", AlertView.as_view(), name="alerts"),
    path("heatmap/", HeatmapView.as_view(), name="heatmap"),
    path('recurring-expenses/', RecurringExpenseListCreateView.as_view(), name='recurring-expenses-list-create'),
    path('recurring-expenses/<int:id>/', RecurringExpenseDetailView.as_view(), name='recurring-expenses-detail'),
    path('analytics/category/', CategoryAnalyticsView.as_view(), name='category-analytics'),
    path("top-expenses/", top_expenses, name="top-expenses"),


]
