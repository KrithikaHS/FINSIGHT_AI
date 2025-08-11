from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from django.contrib.auth.models import User
from django.db.models import Sum, Count
from accounts.models import Expense, Recommendation, RecurringExpense
import numpy as np

def cluster_users_and_create_recommendations():
    users = User.objects.all()
    user_ids = []
    features = []

    categories = ['Food', 'Travel', 'Shopping', 'Utilities', 'Entertainment', 'Misc']

    for user in users:
        user_ids.append(user.id)
        agg = (
            Expense.objects.filter(user=user)
            .values('category')
            .annotate(total_amount=Sum('amount'), count=Count('id'))
        )
        cat_totals = {c: 0.0 for c in categories}
        cat_counts = {c: 0 for c in categories}
        for entry in agg:
            cat_name = entry['category']
            if cat_name in cat_totals:
                cat_totals[cat_name] = float(entry['total_amount'])
                cat_counts[cat_name] = entry['count']
            else:
                cat_totals['Misc'] += float(entry['total_amount'])
                cat_counts['Misc'] += entry['count']

        total_spent = sum(cat_totals.values())
        avg_expense = total_spent / sum(cat_counts.values()) if sum(cat_counts.values()) > 0 else 0

        recurring_count = RecurringExpense.objects.filter(user=user).count()

        # Feature vector: total spend per category + count per category + avg expense + recurring count
        feat = []
        # Spend amounts
        feat.extend([cat_totals[c] for c in categories])
        # Counts
        feat.extend([cat_counts[c] for c in categories])
        # Average expense
        feat.append(avg_expense)
        # Recurring expenses count
        feat.append(recurring_count)

        features.append(feat)

    X = np.array(features)
    if len(X) == 0:
        return

    # Scale features for better clustering
    n_clusters = min(6, len(users))
    if n_clusters == 0:
        return

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    kmeans = KMeans(n_clusters=n_clusters, random_state=0).fit(X_scaled)
    labels = kmeans.labels_


    n_clusters = 6  # increased number of clusters
    

    # Clear old recommendations
    Recommendation.objects.all().delete()

    cluster_recs = {
        0: "You spend a lot on Travel. Consider using travel rewards or budget limits.",
        1: "Your Grocery spend is high. Try shopping with a weekly budget.",
        2: "You have mixed expenses. Track subscriptions and recurring charges carefully.",
        3: "Your Utilities spend is higher than average. Consider energy-saving measures.",
        4: "Entertainment expenses are significant. Try setting monthly limits.",
        5: "You have a balanced spending pattern. Keep tracking for better savings.",
    }

    for user_id, label in zip(user_ids, labels):
        user = User.objects.get(id=user_id)
        rec_text = cluster_recs.get(label, "Keep tracking your expenses carefully.")
        Recommendation.objects.create(user=user, text=rec_text)
