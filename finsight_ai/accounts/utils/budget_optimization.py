# accounts/utils/budget_optimization.py
from django.db.models import Sum
from datetime import date, timedelta
import pandas as pd
from prophet import Prophet
from decimal import Decimal

def get_budget_allocation(user, monthly_budget, saving_goal):
    monthly_budget = Decimal(str(monthly_budget))
    saving_goal = Decimal(str(saving_goal))
    spendable_budget = monthly_budget - saving_goal
    if spendable_budget <= 0:
        return {}, "Saving goal must be less than monthly budget."

    # Get last 3 months expenses grouped by category
    end_date = date.today()
    start_date = end_date - timedelta(days=90)
    expenses = (
        user.expense_set.filter(date__range=[start_date, end_date])
        .values('category')
        .annotate(total=Sum('amount'))
    )

    total_spent = sum(e['total'] for e in expenses)
    if total_spent == 0:
        return {}, "No expense data to allocate budget."

    # Calculate % spend per category in last 3 months
    category_percents = {e['category']: e['total']/total_spent for e in expenses}

    # Allocate spendable budget based on % spend
    allocated_budget = {cat: round(spendable_budget * pct, 2) for cat, pct in category_percents.items()}



    return allocated_budget, None


def forecast_category_spending(user, period_days=30):
    # Get historical daily expense sums per category
    end_date = date.today()
    start_date = end_date - timedelta(days=365)
    df_list = []

    categories = user.expense_set.values_list('category', flat=True).distinct()

    for category in categories:
        qs = (
            user.expense_set.filter(date__range=[start_date, end_date], category=category)
            .values('date')
            .annotate(total=Sum('amount'))
            .order_by('date')
        )
        data = pd.DataFrame(list(qs))
        if data.empty or len(data.dropna()) < 2:
        # Skip categories without enough data for forecasting
            continue
        data.rename(columns={'date': 'ds', 'total': 'y'}, inplace=True)

        model = Prophet(daily_seasonality=True)
        model.fit(data)

        future = model.make_future_dataframe(periods=period_days)
        forecast = model.predict(future)
        forecast_period = forecast.tail(period_days)[['ds', 'yhat']]

        df_list.append((category, forecast_period))

    # Combine forecasts in dict: category -> list of forecast amounts
    forecasts = {}
    for cat, df in df_list:
        forecasts[cat] = df['yhat'].clip(lower=0).round(2).tolist()

    return forecasts

def get_current_month_spending(user):
    today = date.today()
    start_month = today.replace(day=1)
    qs = (
        user.expense_set.filter(date__gte=start_month)
        .values('category')
        .annotate(total=Sum('amount'))
    )
    spending = {e['category']: e['total'] for e in qs}
    return spending
