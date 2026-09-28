from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import health, chat, symptoms, assessment, predict
from .services.prediction_service import load_predictor

import logging

app = FastAPI(
    title="AI HealthAssist API",
    description="Conversational disease prediction API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(symptoms.router, prefix="/api", tags=["Symptoms"])
app.include_router(assessment.router, prefix="/api", tags=["Assessment"])
app.include_router(predict.router, prefix="/api", tags=["Predict"])
