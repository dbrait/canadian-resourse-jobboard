"""
API Routes aggregation.
"""

from fastapi import APIRouter

from app.api.routes import auth, employers, jobs, users

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(employers.router, prefix="/employers", tags=["Employers"])
