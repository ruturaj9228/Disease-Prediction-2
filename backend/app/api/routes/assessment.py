from fastapi import APIRouter, HTTPException
from ...schemas.api_schemas import AssessmentResponse
from ...services.chat_service import get_session, reset_session

router = APIRouter()

@router.get("/assessment/{session_id}", response_model=AssessmentResponse)
def get_assessment(session_id: str):
    state = get_session(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="session_not_found")
    
    return AssessmentResponse(
        session_id=state['session_id'],
        status=state['assessment_status'],
        symptoms=state['symptoms'],
        duration=state['duration'],
        severity=state['severity'],
        messages=state['messages'],
        current_question=state.get('current_question')
    )

@router.post("/assessment/{session_id}/reset")
def reset_assessment(session_id: str):
    state = reset_session(session_id)
    return {
        "session_id": session_id,
        "status": "reset"
    }
