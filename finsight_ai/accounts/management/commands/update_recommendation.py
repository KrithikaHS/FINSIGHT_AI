from django.core.management.base import BaseCommand
from accounts.utils.clustering import cluster_users_and_create_recommendations

class Command(BaseCommand):
    help = "Run clustering to generate personalized budget recommendations"

    def handle(self, *args, **kwargs):
        cluster_users_and_create_recommendations()
        self.stdout.write(self.style.SUCCESS('Successfully updated recommendations'))
