from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

from backend.app.main import app
from backend.app.db.database import get_db, Base
from backend.app.db.models import GuidanceContent

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_healthassist.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def setup_module(module):
    # Setup guidance data for tests
    db = TestingSessionLocal()
    if not db.query(GuidanceContent).filter_by(condition_name="Malaria").first():
        db.add(GuidanceContent(condition_name="Malaria", description="Test description"))
        db.commit()
    db.close()

def teardown_module(module):
    Base.metadata.drop_all(bind=engine)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200

def test_chat_and_predict_and_history():
    # 1. Start Chat
    res = client.post("/api/chat/message", json={"session_id": "", "message": "I have headache"})
    assert res.status_code == 200
    session_id = res.json()["session_id"]
    
    # Send another symptom to get more state
    res = client.post("/api/chat/message", json={"session_id": session_id, "message": "I also have fever"})
    
    # 2. Extract Symptoms (if needed, or just rely on predict which uses session)
    # Actually, we can just predict right away if we have symptoms
    res_predict = client.post("/api/predict", json={"session_id": session_id})
    assert res_predict.status_code == 200
    pred_data = res_predict.json()
    assert "prediction" in pred_data
    assert "assessment_id" in pred_data
    
    assessment_id = pred_data["assessment_id"]
    assert assessment_id is not None

    # 3. History List
    res_history = client.get("/api/history")
    assert res_history.status_code == 200
    hist = res_history.json()
    assert len(hist) > 0
    assert any(h["assessment_id"] == assessment_id for h in hist)

    # 4. History Detail
    res_detail = client.get(f"/api/history/{assessment_id}")
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["assessment_id"] == assessment_id
    assert detail["prediction"]["predicted_condition"] == pred_data["prediction"]

    # 5. Guidance
    res_guid = client.get(f"/api/assessment/{assessment_id}/guidance")
    assert res_guid.status_code == 200
    # it might be available or not depending on the prediction result
    
    # 6. Delete Assessment
    res_del = client.delete(f"/api/history/{assessment_id}")
    assert res_del.status_code == 200
    
    res_detail2 = client.get(f"/api/history/{assessment_id}")
    assert res_detail2.status_code == 404

def test_analytics():
    res = client.get("/api/analytics/models")
    assert res.status_code == 200
    data = res.json()
    assert "metrics" in data
    assert "confusion_matrix" in data
    assert "feature_importance" in data
