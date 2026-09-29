from sqlalchemy.orm import Session
from ..db.models import GuidanceContent

def get_guidance_for_condition(db: Session, condition_name: str) -> dict:
    guidance = db.query(GuidanceContent).filter(GuidanceContent.condition_name == condition_name).first()
    if not guidance:
        return {
            "available": False,
            "message": "Supportive information is not currently available for this condition in this prototype."
        }
    
    return {
        "available": True,
        "condition": guidance.condition_name,
        "description": guidance.description,
        "supportive_care": guidance.supportive_care,
        "general_precautions": guidance.general_precautions,
        "things_to_avoid": guidance.things_to_avoid,
        "warning_signs": guidance.warning_signs,
        "when_to_seek_care": guidance.when_to_seek_care,
        "source": {
            "name": guidance.source_name,
            "url": guidance.source_url,
            "last_reviewed": guidance.last_reviewed
        }
    }
