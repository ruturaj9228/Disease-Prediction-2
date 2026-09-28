import os
import sys
import unittest
import numpy as np

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from preprocessing.pipeline import DataPreprocessor
from prediction.predict import DiseasePredictor

class TestMLPipeline(unittest.TestCase):
    def setUp(self):
        self.preprocessor = DataPreprocessor()
        self.predictor = DiseasePredictor()

    def test_dataset_loading(self):
        df = self.preprocessor.load_data('Training.csv', remove_duplicates=False)
        self.assertGreater(len(df), 0, "Dataset should have rows")
        self.assertIn('prognosis', df.columns, "Target column missing")

    def test_feature_ordering(self):
        self.assertIsNotNone(self.predictor.feature_columns, "Feature columns should be loaded")
        self.assertIsInstance(self.predictor.feature_columns, list, "Feature columns should be a list")
        self.assertNotIn('prognosis', self.predictor.feature_columns, "prognosis should not be a feature")

    def test_model_loading(self):
        self.assertIsNotNone(self.predictor.model, "Model should be loaded")
        self.assertIsNotNone(self.predictor.label_encoder, "Label encoder should be loaded")

    def test_prediction_format(self):
        sample_input = {"itching": True, "skin_rash": True}
        res = self.predictor.predict(sample_input)
        self.assertIn("prediction", res)
        self.assertIn("model_score", res)
        self.assertIn("top_predictions", res)
        self.assertIn("symptoms_used", res)

    def test_unknown_symptom_handling(self):
        sample_input = {"itching": True, "made_up_symptom": True}
        res = self.predictor.predict(sample_input)
        self.assertIn("itching", res["symptoms_used"])
        self.assertNotIn("made_up_symptom", res["symptoms_used"], "Unknown symptoms should be ignored")

    def test_missing_symptom_handling(self):
        # Empty input should still return a valid format (perhaps predicting the most common class or baseline)
        res = self.predictor.predict({})
        self.assertEqual(len(res["symptoms_used"]), 0)
        self.assertIn("prediction", res)

    def test_reloaded_output(self):
        sample_input = {"itching": True, "skin_rash": True}
        res1 = self.predictor.predict(sample_input)
        
        # Reload
        new_predictor = DiseasePredictor()
        res2 = new_predictor.predict(sample_input)
        
        self.assertEqual(res1["prediction"], res2["prediction"])
        self.assertEqual(res1["model_score"], res2["model_score"])

if __name__ == '__main__':
    unittest.main()
