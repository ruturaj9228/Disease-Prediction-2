import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..db.models import Assessment, AssessmentSymptom, ConversationMessage, Prediction

def get_all_assessments(db: Session):
    assessments = db.query(Assessment).order_by(desc(Assessment.created_at)).all()
    results = []
    for a in assessments:
        prediction = None
        model_score = None
        if a.prediction:
            prediction = a.prediction.predicted_condition
            model_score = a.prediction.model_score
        
        results.append({
            "assessment_id": a.id,
            "date": a.created_at.isoformat(),
            "prediction": prediction,
            "model_score": model_score,
            "symptoms_count": len(a.symptoms),
            "status": a.status
        })
    return results

def get_assessment_detail(db: Session, assessment_id: str):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        return None
    
    symptoms = [{"name": s.name, "status": s.status, "source": s.source} for s in a.symptoms]
    messages = [{"id": m.id, "sender": m.sender, "text": m.text, "timestamp": m.timestamp.isoformat()} for m in a.messages]
    
    prediction_data = None
    if a.prediction:
        prediction_data = {
            "predicted_condition": a.prediction.predicted_condition,
            "model_score": a.prediction.model_score,
            "top_predictions": a.prediction.top_predictions,
            "symptoms_used": a.prediction.symptoms_used,
            "model_version": a.prediction.model_version,
            "timestamp": a.prediction.timestamp.isoformat()
        }

    return {
        "assessment_id": a.id,
        "session_id": a.session_id,
        "created_at": a.created_at.isoformat(),
        "completed_at": a.completed_at.isoformat() if a.completed_at else None,
        "status": a.status,
        "duration": a.duration,
        "severity": a.severity,
        "safety_flag": a.safety_flag,
        "symptoms": symptoms,
        "messages": messages,
        "prediction": prediction_data
    }

def delete_assessment(db: Session, assessment_id: str):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        return False
    db.delete(a)
    db.commit()
    return True
