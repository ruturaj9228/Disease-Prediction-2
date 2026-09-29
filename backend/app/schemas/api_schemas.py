from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal

class Message(BaseModel):
    id: str
    sender: Literal['user', 'assistant', 'system']
    text: str

class ChatMessageRequest(BaseModel):
    session_id: str
    message: str

class ExtractedSymptom(BaseModel):
    name: str
    status: Literal['PRESENT', 'ABSENT', 'UNKNOWN']

class ChatMessageResponse(BaseModel):
    session_id: str
    assistant_message: str
    extracted_symptoms: List[ExtractedSymptom]
    assessment_status: Literal['collecting', 'ready', 'emergency']
    duration: Optional[str]
    severity: Optional[str]
    safety_flag: bool
    current_question: Optional[Dict] = None

class DurationModel(BaseModel):
    value: int
    unit: str

class AssessmentResponse(BaseModel):
    session_id: str
    status: Literal['collecting', 'ready', 'emergency', 'reset']
    symptoms: Dict[str, Literal['PRESENT', 'ABSENT', 'UNKNOWN']]
    duration: Optional[str]
    severity: Optional[str]
    messages: List[Message]
    current_question: Optional[Dict] = None

class PredictionRequest(BaseModel):
    session_id: str

class TopPrediction(BaseModel):
    disease: str
    model_score: float

class PredictionResponse(BaseModel):
    prediction: str
    model_score: Optional[float]
    top_predictions: List[TopPrediction]
    symptoms_used: List[str]
    assessment_id: Optional[str] = None

class SafetyResponse(BaseModel):
    safety_flag: bool
    requires_urgent_attention: bool
    message: str

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str

class SymptomExtractionRequest(BaseModel):
    message: str

class SymptomExtractionResponse(BaseModel):
    symptoms: List[ExtractedSymptom]
    duration: Optional[str]
    severity: Optional[str]
