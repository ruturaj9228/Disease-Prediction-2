import uuid
import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ...schemas.api_schemas import PredictionRequest, PredictionResponse, TopPrediction
from ...services.prediction_service import get_prediction
from ...services.chat_service import get_session
from ...db.database import get_db
from ...db.models import Assessment, AssessmentSymptom, ConversationMessage, Prediction

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
def predict_disease(req: PredictionRequest, db: Session = Depends(get_db)):
    state = get_session(req.session_id)
    if not state:
        raise HTTPException(status_code=404, detail="session_not_found")
        
    if state['assessment_status'] == 'emergency':
        raise HTTPException(status_code=400, detail="Cannot predict during emergency state.")

    symptoms_dict = {sym: (status == 'PRESENT') for sym, status in state['symptoms'].items()}
    
    try:
        res = get_prediction(symptoms_dict)
    except Exception as e:
        raise HTTPException(status_code=503, detail="model_unavailable")
        
    # Save to database
    assessment_id = str(uuid.uuid4())
    
    db_assessment = Assessment(
        id=assessment_id,
        session_id=state['session_id'],
        status="completed",
        duration=state.get('duration'),
        severity=state.get('severity'),
        safety_flag=False,
        completed_at=datetime.datetime.utcnow()
    )
    db.add(db_assessment)
    
    for sym_name, sym_status in state['symptoms'].items():
        db_sym = AssessmentSymptom(
            assessment_id=assessment_id,
            name=sym_name,
            status=sym_status,
            source="nlp"
        )
        db.add(db_sym)
        
    for msg in state['messages']:
        db_msg = ConversationMessage(
            id=msg['id'],
            assessment_id=assessment_id,
            sender=msg['sender'],
            text=msg['text']
        )
        db.add(db_msg)
        
    db_pred = Prediction(
        assessment_id=assessment_id,
        predicted_condition=res['prediction'],
        model_score=res['model_score'],
        top_predictions=res['top_predictions'],
        symptoms_used=res['symptoms_used'],
        model_version="random_forest_v1"
    )
    db.add(db_pred)
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save assessment to database.")
        
    top_preds = [
        TopPrediction(disease=tp['disease'], model_score=tp['model_score'])
        for tp in res['top_predictions']
    ]
    
    return PredictionResponse(
        prediction=res['prediction'],
        model_score=res['model_score'],
        top_predictions=top_preds,
        symptoms_used=res['symptoms_used'],
        assessment_id=assessment_id
    )
