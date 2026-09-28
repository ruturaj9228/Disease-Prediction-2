from fastapi import APIRouter, HTTPException
from ...schemas.api_schemas import SymptomExtractionRequest, SymptomExtractionResponse, ExtractedSymptom
from ...services.symptom_service import extract_symptoms, extract_duration, extract_severity

router = APIRouter()

@router.post("/symptoms/extract", response_model=SymptomExtractionResponse)
def extract_symptoms_endpoint(req: SymptomExtractionRequest):
    extracted = extract_symptoms(req.message)
    duration = extract_duration(req.message)
    severity = extract_severity(req.message)
    
    symptoms = []
    for sym in extracted['present']:
        symptoms.append(ExtractedSymptom(name=sym, status='PRESENT'))
    for sym in extracted['absent']:
        symptoms.append(ExtractedSymptom(name=sym, status='ABSENT'))
    for sym in extracted['unknown']:
        symptoms.append(ExtractedSymptom(name=sym, status='UNKNOWN'))
        
    return SymptomExtractionResponse(
        symptoms=symptoms,
        duration=duration,
        severity=severity
    )
