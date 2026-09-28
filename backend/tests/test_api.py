from fastapi.testclient import TestClient
from backend.app.main import app
import pytest

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "AI HealthAssist API",
        "version": "1.0.0"
    }

def test_symptoms_extract():
    response = client.post("/api/symptoms/extract", json={"message": "I have a fever but no cough"})
    assert response.status_code == 200
    data = response.json()
    symptoms = {s['name']: s['status'] for s in data['symptoms']}
    assert symptoms.get("high_fever") == "PRESENT"
    assert symptoms.get("cough") == "ABSENT"

def test_chat_message():
    # Start session
    response = client.post("/api/chat/message", json={"session_id": "test-123", "message": "I have fever"})
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == "test-123"
    assert data["assessment_status"] == "collecting"
    assert any(s["name"] == "high_fever" and s["status"] == "PRESENT" for s in data["extracted_symptoms"])
    
def test_assessment_state():
    response = client.get("/api/assessment/test-123")
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == "test-123"
    assert data["symptoms"]["high_fever"] == "PRESENT"

def test_safety_flag():
    response = client.post("/api/chat/message", json={"session_id": "test-safety", "message": "I have severe chest pain"})
    assert response.status_code == 200
    data = response.json()
    assert data["safety_flag"] is True
    assert data["assessment_status"] == "emergency"

def test_predict_disease():
    # Setup state to ready
    client.post("/api/chat/message", json={"session_id": "test-pred", "message": "I have fever, headache, body pain, and fatigue for 3 days. My headache is severe. No nausea."})
    
    response = client.post("/api/predict", json={"session_id": "test-pred"})
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "model_score" in data
    assert "top_predictions" in data

def test_reset_assessment():
    response = client.post("/api/assessment/test-123/reset")
    assert response.status_code == 200
    
    response = client.get("/api/assessment/test-123")
    assert response.status_code == 200
    data = response.json()
    assert len(data["symptoms"]) == 0
