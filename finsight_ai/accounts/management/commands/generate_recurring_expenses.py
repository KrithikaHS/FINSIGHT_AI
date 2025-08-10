from django.core.management.base import BaseCommand
from accounts.models import RecurringExpense, Expense
from datetime import date, timedelta
from django.utils import timezone

class Command(BaseCommand):
    help = "Generate expenses from recurring expenses"

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        recurring_expenses = RecurringExpense.objects.all()

        for rec_exp in recurring_expenses:
            last_date = rec_exp.last_generated or rec_exp.start_date
            next_date = last_date
            while next_date <= today:
                exists = Expense.objects.filter(
                    user=rec_exp.user,
                    title=rec_exp.title,
                    amount=rec_exp.amount,
                    category=rec_exp.category,
                    date=next_date,
                ).exists()

                if not exists:
                    Expense.objects.create(
                        user=rec_exp.user,
                        title=rec_exp.title,
                        amount=rec_exp.amount,
                        category=rec_exp.category,
                        date=next_date,
                    )
                    self.stdout.write(f"Created expense for {rec_exp.title} on {next_date}")

                if rec_exp.frequency == 'daily':
                    next_date += timedelta(days=1)
                elif rec_exp.frequency == 'weekly':
                    next_date += timedelta(weeks=1)
                elif rec_exp.frequency == 'monthly':
                    month = next_date.month + 1
                    year = next_date.year + (month - 1) // 12
                    month = (month - 1) % 12 + 1
                    day = min(next_date.day, 28)
                    next_date = date(year, month, day)
                elif rec_exp.frequency == 'yearly':
                    next_date = date(next_date.year + 1, next_date.month, next_date.day)
                else:
                    break

                if next_date > today:
                    rec_exp.last_generated = last_date
                    rec_exp.save()
                    break
