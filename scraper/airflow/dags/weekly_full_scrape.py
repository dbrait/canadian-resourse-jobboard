"""
Weekly Full Scrape DAG.

This DAG runs weekly to do a complete refresh of all job data,
including re-indexing Elasticsearch and cleaning up stale data.

Schedule: Every Sunday at 2 AM UTC
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.utils.task_group import TaskGroup


default_args = {
    "owner": "resources-job-board",
    "depends_on_past": False,
    "email_on_failure": True,
    "retries": 1,
    "retry_delay": timedelta(minutes=15),
    "execution_timeout": timedelta(hours=6),
}

dag = DAG(
    dag_id="weekly_full_scrape",
    default_args=default_args,
    description="Weekly full refresh of all job sources",
    schedule_interval="0 2 * * 0",  # 2 AM UTC every Sunday
    start_date=datetime(2024, 1, 1),
    catchup=False,
    max_active_runs=1,
    tags=["scraping", "jobs", "weekly", "full-refresh"],
)


def reindex_elasticsearch(**kwargs):
    """Reindex all jobs in Elasticsearch."""
    import os
    from elasticsearch import Elasticsearch

    es_url = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
    es = Elasticsearch([es_url])

    # Create new index with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    new_index = f"jobs_{timestamp}"

    # Get current index mapping
    old_index = "jobs"

    try:
        mapping = es.indices.get_mapping(index=old_index)
        settings = es.indices.get_settings(index=old_index)

        # Create new index
        es.indices.create(
            index=new_index,
            body={
                "mappings": mapping[old_index]["mappings"],
                "settings": {
                    "number_of_shards": 1,
                    "number_of_replicas": 0,
                }
            }
        )

        # Reindex data
        es.reindex(
            body={
                "source": {"index": old_index},
                "dest": {"index": new_index}
            },
            wait_for_completion=True,
        )

        # Update alias
        es.indices.update_aliases(
            body={
                "actions": [
                    {"remove": {"index": old_index, "alias": "jobs_current"}},
                    {"add": {"index": new_index, "alias": "jobs_current"}},
                ]
            }
        )

        print(f"Reindexed to {new_index}")
        return {"new_index": new_index, "status": "success"}

    except Exception as e:
        print(f"Reindex failed: {e}")
        raise


def update_company_metadata(**kwargs):
    """Update company metadata from scraped data."""
    import os
    import psycopg2

    db_url = os.getenv("DATABASE_URL_SYNC")
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()

    # Update company job counts
    cursor.execute("""
        UPDATE companies c
        SET job_count = (
            SELECT COUNT(*) FROM jobs j
            WHERE j.company_name ILIKE c.name
            AND j.is_active = true
        )
    """)

    # Mark inactive companies (no jobs in 30 days)
    cursor.execute("""
        UPDATE companies
        SET is_active = false
        WHERE id NOT IN (
            SELECT DISTINCT company_id FROM jobs
            WHERE scraped_at > NOW() - INTERVAL '30 days'
            AND company_id IS NOT NULL
        )
        AND is_scraped = true
    """)

    conn.commit()
    cursor.close()
    conn.close()

    print("Company metadata updated")


def generate_sitemap(**kwargs):
    """Generate sitemap for SEO."""
    import os

    sitemap_content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://resourcesjobboard.ca/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://resourcesjobboard.ca/jobs</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://resourcesjobboard.ca/companies</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>
"""
    # In production, this would be uploaded to the frontend/public folder
    print("Sitemap generated")
    return sitemap_content


with dag:

    # Phase 1: Preparation
    with TaskGroup("preparation", tooltip="Prepare for full scrape") as preparation:

        backup_database = BashOperator(
            task_id="backup_database",
            bash_command="""
                pg_dump $DATABASE_URL_SYNC | gzip > /backups/jobs_$(date +%Y%m%d).sql.gz
                echo "Database backed up"
            """,
        )

        clear_cache = BashOperator(
            task_id="clear_cache",
            bash_command="""
                redis-cli -u $REDIS_URL FLUSHDB
                echo "Cache cleared"
            """,
        )

    # Phase 2: Full scrape (all sources in parallel)
    with TaskGroup("full_scrape", tooltip="Scrape all sources") as full_scrape:

        # This would contain all spider tasks
        # For brevity, using a single task that runs all spiders
        run_all_spiders = BashOperator(
            task_id="run_all_spiders",
            bash_command="""
                cd /app/scraper
                scrapy crawl jobbank
                scrapy crawl workday
                scrapy crawl greenhouse
                scrapy crawl lever
                echo "All spiders completed"
            """,
            execution_timeout=timedelta(hours=4),
        )

    # Phase 3: Post-processing
    with TaskGroup("post_processing", tooltip="Post-scrape tasks") as post_processing:

        reindex_es = PythonOperator(
            task_id="reindex_elasticsearch",
            python_callable=reindex_elasticsearch,
        )

        update_companies = PythonOperator(
            task_id="update_company_metadata",
            python_callable=update_company_metadata,
        )

        sitemap = PythonOperator(
            task_id="generate_sitemap",
            python_callable=generate_sitemap,
        )

    # Phase 4: Notification
    notify = BashOperator(
        task_id="notify_completion",
        bash_command="""
            echo "Weekly full scrape completed at $(date)"
            # Add notification logic here
        """,
    )

    # Dependencies
    preparation >> full_scrape >> post_processing >> notify
