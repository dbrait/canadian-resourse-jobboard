"""
Daily Scraping DAG.

This DAG runs daily to scrape jobs from all sources.
It uses Scrapy Cloud for execution via the Zyte API.

Schedule: Daily at 6 AM UTC
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.utils.task_group import TaskGroup


# Default arguments for all tasks
default_args = {
    "owner": "resources-job-board",
    "depends_on_past": False,
    "email_on_failure": True,
    "email_on_retry": False,
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
    "execution_timeout": timedelta(hours=2),
}

# DAG definition
dag = DAG(
    dag_id="daily_job_scrape",
    default_args=default_args,
    description="Daily scraping of all job sources",
    schedule_interval="0 6 * * *",  # 6 AM UTC daily
    start_date=datetime(2024, 1, 1),
    catchup=False,
    max_active_runs=1,
    tags=["scraping", "jobs", "daily"],
)


def run_scrapy_spider(spider_name: str, **kwargs):
    """
    Run a Scrapy spider using the Scrapy Cloud API.

    For local development, falls back to direct Scrapy execution.
    """
    import os
    import subprocess

    # Check if we're using Scrapy Cloud
    shub_project_id = os.getenv("SHUB_PROJECT_ID")
    zyte_api_key = os.getenv("ZYTE_API_KEY")

    if shub_project_id and zyte_api_key:
        # Run via Scrapy Cloud API
        import requests

        url = f"https://app.zyte.com/api/v2/projects/{shub_project_id}/spiders/{spider_name}/jobs"
        headers = {
            "Authorization": f"Bearer {zyte_api_key}",
            "Content-Type": "application/json",
        }
        response = requests.post(url, headers=headers, json={})

        if response.status_code == 201:
            job_data = response.json()
            print(f"Started Scrapy Cloud job: {job_data.get('key')}")
            return job_data
        else:
            raise Exception(f"Failed to start job: {response.text}")
    else:
        # Run locally
        result = subprocess.run(
            ["scrapy", "crawl", spider_name],
            cwd="/app/scraper",
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            raise Exception(f"Spider failed: {result.stderr}")
        print(result.stdout)
        return {"status": "completed", "spider": spider_name}


# Task Groups for organization
with dag:

    # API Sources (fastest, run first)
    with TaskGroup("api_sources", tooltip="API-based job sources") as api_sources:

        scrape_jobbank = PythonOperator(
            task_id="scrape_jobbank",
            python_callable=run_scrapy_spider,
            op_kwargs={"spider_name": "jobbank"},
        )

    # ATS Sources (Workday, Greenhouse, Lever)
    with TaskGroup("ats_sources", tooltip="ATS platform sources") as ats_sources:

        scrape_workday = PythonOperator(
            task_id="scrape_workday",
            python_callable=run_scrapy_spider,
            op_kwargs={"spider_name": "workday"},
        )

        scrape_greenhouse = PythonOperator(
            task_id="scrape_greenhouse",
            python_callable=run_scrapy_spider,
            op_kwargs={"spider_name": "greenhouse"},
        )

        scrape_lever = PythonOperator(
            task_id="scrape_lever",
            python_callable=run_scrapy_spider,
            op_kwargs={"spider_name": "lever"},
        )

    # Cleanup and notification
    cleanup_expired_jobs = BashOperator(
        task_id="cleanup_expired_jobs",
        bash_command="""
            curl -X POST "${API_URL}/api/admin/jobs/cleanup" \
                -H "Authorization: Bearer ${ADMIN_API_KEY}" \
                -H "Content-Type: application/json" \
                -d '{"days_old": 60}'
        """,
    )

    notify_completion = BashOperator(
        task_id="notify_completion",
        bash_command="""
            echo "Daily scrape completed at $(date)"
            # Add Slack/email notification here if needed
        """,
    )

    # Task dependencies
    api_sources >> ats_sources >> cleanup_expired_jobs >> notify_completion
