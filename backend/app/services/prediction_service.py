import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from ml.prediction.predict import DiseasePredictor

_predictor = None

def load_predictor():
    global _predictor
    if _predictor is None:
        try:
            _predictor = DiseasePredictor()
        except Exception as e:
            print(f"Error loading predictor: {e}")
            raise e

def get_prediction(symptoms: dict) -> dict:
    if not _predictor:
        load_predictor()
    return _predictor.predict(symptoms)
