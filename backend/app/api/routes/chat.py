from fastapi import APIRouter, HTTPException
from ...schemas.api_schemas import ChatMessageRequest, ChatMessageResponse, ExtractedSymptom
from ...services.chat_service import process_user_message, get_session

router = APIRouter()

@router.post("/chat/message", response_model=ChatMessageResponse)
def send_message(req: ChatMessageRequest):
    state = process_user_message(req.session_id, req.message)
    
    # Map symptoms format
    extracted = [{"name": k, "status": v} for k, v in state['symptoms'].items()]
    
    return ChatMessageResponse(
        session_id=state['session_id'],
        assistant_message=state['messages'][-1]['text'],
        extracted_symptoms=extracted,
        assessment_status=state['assessment_status'],
        duration=state['duration'],
        severity=state['severity'],
        safety_flag=(state['assessment_status'] == 'emergency'),
        current_question=state.get('current_question')
    )
