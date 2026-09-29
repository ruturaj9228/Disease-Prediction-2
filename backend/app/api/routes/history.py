from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...db.database import get_db
from ...services.history_service import get_all_assessments, get_assessment_detail, delete_assessment
from ...services.guidance_service import get_guidance_for_condition

router = APIRouter()

@router.get("/history")
def list_history(db: Session = Depends(get_db)):
    return get_all_assessments(db)

@router.get("/history/{assessment_id}")
def get_history_detail(assessment_id: str, db: Session = Depends(get_db)):
    detail = get_assessment_detail(db, assessment_id)
    if not detail:
        raise HTTPException(status_code=404, detail="assessment_not_found")
    return detail

@router.delete("/history/{assessment_id}")
def delete_history(assessment_id: str, db: Session = Depends(get_db)):
    success = delete_assessment(db, assessment_id)
    if not success:
        raise HTTPException(status_code=404, detail="assessment_not_found")
    return {"success": True}

@router.get("/assessment/{assessment_id}/guidance")
def get_guidance(assessment_id: str, db: Session = Depends(get_db)):
    detail = get_assessment_detail(db, assessment_id)
    if not detail or not detail.get("prediction"):
        raise HTTPException(status_code=404, detail="assessment_prediction_not_found")
        
    predicted_condition = detail["prediction"]["predicted_condition"]
    return get_guidance_for_condition(db, predicted_condition)
