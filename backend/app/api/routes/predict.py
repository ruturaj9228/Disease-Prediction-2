from fastapi import APIRouter, HTTPException
from ...schemas.api_schemas import PredictionRequest, PredictionResponse, TopPrediction
from ...services.prediction_service import get_prediction
from ...services.chat_service import get_session

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
def predict_disease(req: PredictionRequest):
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
        
    top_preds = [
        TopPrediction(disease=tp['disease'], model_score=tp['model_score'])
        for tp in res['top_predictions']
    ]
    
    return PredictionResponse(
        prediction=res['prediction'],
        model_score=res['model_score'],
        top_predictions=top_preds,
        symptoms_used=res['symptoms_used']
    )
