# AI HealthAssist — ML Engine (Phase 2)

## 1. Dataset
This project uses the publicly available "Disease Prediction Using Machine Learning" dataset. The dataset includes `Training.csv` and `Testing.csv`.
It maps a collection of binary symptom features (like `itching`, `skin_rash`, `fever`) to a target variable (`prognosis`), which represents the associated disease.

## 2. Dataset Limitations
**Medical Safety Disclaimer:**
> **This model is an experimental machine-learning classifier trained on a public symptom-disease dataset. Its predictions are not clinically validated and should not be treated as a medical diagnosis.**

The dataset has several limitations:
- Heavy repetition and identical feature rows.
- No severity, duration, or demographic dimensions to the symptoms.
- "Perfect" matches represent academic mapping rather than realistic clinical variance.

## 3. Preprocessing
The preprocessing pipeline (`backend/ml/preprocessing/pipeline.py`) includes:
- Stripping and normalizing column names.
- Identifying and dropping extraneous columns (like `Unnamed: 133`).
- Fixing the symptom feature order to guarantee consistency between training and prediction.
- Encoding the target variable (`prognosis`) using `LabelEncoder`.

## 4. Duplicate & Leakage Analysis
An analysis was performed on the dataset:
- `Training.csv` contains 4920 rows.
- There are **4616 duplicate rows**, resulting in only **304 unique symptom patterns**.
- A leakage check showed that 41 symptom patterns in `Testing.csv` overlap identically with patterns in `Training.csv`.
This means that using the original dataset with its predefined test split severely overestimates generalization due to data leakage.

## 5. Train/Test Methodology
To provide a more robust evaluation, two experiments were run:
- **Experiment A (Original Data)**: Trained on `Training.csv` and tested on `Testing.csv`. All models achieve ~1.0 F1 score.
- **Experiment B (Duplicate-Cleaned)**: Deduplicated `Training.csv`, removing all repeating patterns, then split using a stratified 80/20 train/test split. Cross-validation (5 folds) was applied to ensure the models didn't overfit.

## 6. Models Tested
1. Decision Tree
2. Random Forest
3. Naive Bayes
4. K-Nearest Neighbors (KNN)
5. Support Vector Machine (SVM)
6. Gradient Boosting

## 7. Evaluation Metrics
Models were evaluated on:
- Accuracy
- Macro Precision, Recall, and F1-score
- Weighted Precision, Recall, and F1-score

## 8. Results
The experiment results (found in `backend/ml/evaluation/model_metrics.json`) show that while models like Gradient Boosting and Decision Tree dropped significantly in the duplicate-free dataset, Random Forest and SVM maintained very high CV generalization scores.
A plot comparing the performance of the models on Original vs Cleaned datasets is available in `backend/ml/evaluation/plots/model_comparison.png`.

## 9. Final Model
**Random Forest** was selected as the best-performing model on this experimental duplicate-cleaned dataset. 
It provides excellent generalization (Macro F1: 1.0 on CV), supports probability extraction (`predict_proba`), and offers feature importances for explainability. The trained model and metadata are saved in `backend/ml/models/`.

## 10. Prediction Input Format
The prediction service expects a dictionary of symptom names to boolean (or 1/0) values. Any missing symptoms are assumed false (0).
```python
{
    "fever": True,
    "headache": True,
    "cough": False,
    "fatigue": True
}
```

## 11. Prediction Output Format
The service returns a structured dictionary:
```python
{
    "prediction": "Malaria",
    "model_score": 0.85,
    "top_predictions": [
        {"disease": "Malaria", "model_score": 0.85},
        {"disease": "Dengue", "model_score": 0.12},
        {"disease": "Typhoid", "model_score": 0.03}
    ],
    "symptoms_used": ["fever", "headache", "fatigue"]
}
```
**Note**: `model_score` represents the underlying classifier probability estimate, **not** a calibrated medical clinical probability.

## 12. Model Explanations
The `DiseasePredictor` class contains an `explain_prediction()` function which outputs the globally associated features for the model using tree-based `feature_importances_`.
