from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import health, chat, symptoms, assessment, predict, history, analytics
from .services.prediction_service import load_predictor
from .db.database import engine, Base, SessionLocal
from .db.seed import seed_guidance
import logging

app = FastAPI(
    title="AI HealthAssist API",
    description="Conversational disease prediction API",
    version="1.0.0"
)

import os

# CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173,http://127.0.0.1:5173")
origins = [url.strip() for url in FRONTEND_URL.split(",") if url.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    logging.info("Initializing ML models...")
    try:
        load_predictor()
        logging.info("ML Predictor loaded successfully.")
    except Exception as e:
        logging.error(f"Failed to load ML Predictor: {e}")
        
    logging.info("Initializing database...")
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed guidance content if empty
    db = SessionLocal()
    try:
        seed_guidance(db)
        logging.info("Database seeded successfully.")
    except Exception as e:
        logging.error(f"Failed to seed database: {e}")
    finally:
        db.close()

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(symptoms.router, prefix="/api", tags=["Symptoms"])
app.include_router(assessment.router, prefix="/api", tags=["Assessment"])
app.include_router(predict.router, prefix="/api", tags=["Predict"])
app.include_router(history.router, prefix="/api", tags=["History"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
