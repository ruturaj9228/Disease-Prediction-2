import os
import joblib
import pandas as pd
import numpy as np

class DiseasePredictor:
    def __init__(self, model_dir=None):
        if model_dir is None:
            model_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
        self.model_dir = model_dir
        self.model = None
        self.label_encoder = None
        self.feature_columns = None
        self._load_artifacts()

    def _load_artifacts(self):
        model_path = os.path.join(self.model_dir, 'disease_model.joblib')
        le_path = os.path.join(self.model_dir, 'label_encoder.joblib')
        feat_path = os.path.join(self.model_dir, 'feature_columns.joblib')

        if not (os.path.exists(model_path) and os.path.exists(le_path) and os.path.exists(feat_path)):
            raise FileNotFoundError("Model artifacts not found. Please run train_models.py first.")

        self.model = joblib.load(model_path)
        self.label_encoder = joblib.load(le_path)
        self.feature_columns = joblib.load(feat_path)

    def predict(self, symptoms_dict):
        """
        Input: dict of symptom names and boolean values (or 0/1)
        Example: {"fever": True, "headache": False}
        """
        # Create feature vector with exact ordering
        features = np.zeros(len(self.feature_columns))
        symptoms_used = []

        for idx, feature_name in enumerate(self.feature_columns):
            # Also handle potential mismatch in naming (spaces, formatting)
            # The input should ideally match exact names, but we can do a simple lookup
            val = symptoms_dict.get(feature_name, False)
            if val:
                features[idx] = 1
                symptoms_used.append(feature_name)

        features_df = pd.DataFrame([features], columns=self.feature_columns)
        
        # Predict
        pred_idx = self.model.predict(features_df)[0]
        prediction = self.label_encoder.inverse_transform([pred_idx])[0]

        result = {
            "prediction": str(prediction),
            "symptoms_used": symptoms_used,
            "top_predictions": []
        }

        # Handle probabilities if the model supports it
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(features_df)[0]
            result["model_score"] = float(probs[pred_idx])
            
            # Get top 3
            top3_idx = np.argsort(probs)[-3:][::-1]
            for idx in top3_idx:
                disease = self.label_encoder.inverse_transform([idx])[0]
                result["top_predictions"].append({
                    "disease": str(disease),
                    "model_score": float(probs[idx])
                })
        else:
            result["model_score"] = None
            result["top_predictions"].append({
                "disease": str(prediction),
                "model_score": 1.0
            })

        return result

    def explain_prediction(self):
        """
        Prepares the ML layer for future explanation functionality.
        Returns features associated with model predictions.
        """
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
            feat_imp = sorted(zip(self.feature_columns, importances), key=lambda x: x[1], reverse=True)
            return [{"feature": f, "importance": float(i)} for f, i in feat_imp if i > 0]
        return None

if __name__ == '__main__':
    import sys
    import json
    
    predictor = DiseasePredictor()
    if len(sys.argv) > 1:
        try:
            input_data = json.loads(sys.argv[1])
            res = predictor.predict(input_data)
            print(json.dumps(res))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        sample_input = {
            "itching": True,
            "skin_rash": True,
            "nodal_skin_eruptions": True
        }
        res = predictor.predict(sample_input)
        print(json.dumps(res, indent=2))
