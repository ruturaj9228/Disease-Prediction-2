import os
import json
from fastapi import APIRouter, HTTPException

router = APIRouter()

ML_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "ml", "evaluation")

@router.get("/analytics/models")
def get_analytics():
    try:
        metrics_path = os.path.join(ML_DIR, "model_metrics.json")
        confusion_path = os.path.join(ML_DIR, "confusion_matrix.json")
        feature_imp_path = os.path.join(ML_DIR, "feature_importance.json")
        
        with open(metrics_path, "r") as f:
            metrics = json.load(f)
            
        with open(confusion_path, "r") as f:
            confusion = json.load(f)
            
        with open(feature_imp_path, "r") as f:
            feature_imp = json.load(f)
            
        return {
            "metrics": metrics,
            "confusion_matrix": confusion,
            "feature_importance": feature_imp
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load analytics data: {str(e)}")
