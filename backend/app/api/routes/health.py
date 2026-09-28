from fastapi import APIRouter
from ...schemas.api_schemas import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "ok",
        "service": "AI HealthAssist API",
        "version": "1.0.0"
    }
