import os
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
from sklearn.model_selection import train_test_split, cross_val_score
import joblib
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from preprocessing.pipeline import DataPreprocessor

def get_models(seed):
    return {
        "Decision Tree": DecisionTreeClassifier(random_state=seed),
        "Random Forest": RandomForestClassifier(random_state=seed, n_estimators=100),
        "Naive Bayes": GaussianNB(),
        "KNN": KNeighborsClassifier(n_neighbors=5),
        "SVM": SVC(probability=True, random_state=seed),
        "Gradient Boosting": GradientBoostingClassifier(random_state=seed, n_estimators=50)
    }

def evaluate_model(y_true, y_pred, model_name):
    return {
        "model": model_name,
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "macro_precision": float(precision_score(y_true, y_pred, average='macro', zero_division=0)),
        "macro_recall": float(recall_score(y_true, y_pred, average='macro', zero_division=0)),
        "macro_f1": float(f1_score(y_true, y_pred, average='macro', zero_division=0)),
        "weighted_precision": float(precision_score(y_true, y_pred, average='weighted', zero_division=0)),
        "weighted_recall": float(recall_score(y_true, y_pred, average='weighted', zero_division=0)),
        "weighted_f1": float(f1_score(y_true, y_pred, average='weighted', zero_division=0))
    }

def run_experiment():
    base_dir = os.path.join(os.path.dirname(__file__), '..')
    with open(os.path.join(base_dir, 'config', 'experiment_config.json'), 'r') as f:
        config = json.load(f)
        
    seed = config['random_seed']
    
    # -------------------------------------------------------------------------
    # Experiment A: Original Dataset
    # -------------------------------------------------------------------------
    print("--- Running Experiment A: Original Dataset ---")
    preprocessor_orig = DataPreprocessor(data_dir=os.path.join(base_dir, 'data'))
    train_df = preprocessor_orig.load_data('Training.csv', remove_duplicates=False)
    test_df = preprocessor_orig.load_data('Testing.csv', remove_duplicates=False)
    
    X_train_orig, y_train_orig = preprocessor_orig.fit_transform(train_df)
    X_test_orig, y_test_orig = preprocessor_orig.transform(test_df)
    
    results_orig = []
    models_orig = get_models(seed)
    
    for name, model in models_orig.items():
        model.fit(X_train_orig, y_train_orig)
        y_pred = model.predict(X_test_orig)
        res = evaluate_model(y_test_orig, y_pred, name)
        results_orig.append(res)
        print(f"[{name}] Original Accuracy: {res['accuracy']:.4f}, Macro F1: {res['macro_f1']:.4f}")
        
    # -------------------------------------------------------------------------
    # Leakage Analysis
    # -------------------------------------------------------------------------
    train_patterns = set(tuple(x) for x in X_train_orig.to_numpy())
    test_patterns = set(tuple(x) for x in X_test_orig.to_numpy())
    overlap = train_patterns.intersection(test_patterns)
    print(f"\nLeakage Check: {len(overlap)} symptom patterns in Testing.csv also appear in Training.csv")
    
    # -------------------------------------------------------------------------
    # Experiment B: Duplicate-Cleaned Dataset
    # -------------------------------------------------------------------------
    print("\n--- Running Experiment B: Duplicate-Cleaned Dataset ---")
    preprocessor_clean = DataPreprocessor(data_dir=os.path.join(base_dir, 'data'))
    # Load and deduplicate
    clean_df = preprocessor_clean.load_data('Training.csv', remove_duplicates=True)
    
    # We will split this clean dataset since Testing.csv has overlaps
    X_clean, y_clean = preprocessor_clean.fit_transform(clean_df)
    X_train_clean, X_test_clean, y_train_clean, y_test_clean = train_test_split(
        X_clean, y_clean, test_size=config['test_size'], random_state=seed, stratify=y_clean
    )
    
    results_clean = []
    models_clean = get_models(seed)
    
    best_model_name = None
    best_f1 = -1
    best_model = None
    best_predictions = None
    
    for name, model in models_clean.items():
        # CV for clean data
        cv_scores = cross_val_score(model, X_train_clean, y_train_clean, cv=config['cv_folds'], scoring='f1_macro')
        
        model.fit(X_train_clean, y_train_clean)
        y_pred = model.predict(X_test_clean)
        res = evaluate_model(y_test_clean, y_pred, name)
        res['cv_macro_f1_mean'] = float(np.mean(cv_scores))
        res['cv_macro_f1_std'] = float(np.std(cv_scores))
        results_clean.append(res)
        
        print(f"[{name}] Clean Accuracy: {res['accuracy']:.4f}, Macro F1: {res['macro_f1']:.4f} (CV: {res['cv_macro_f1_mean']:.4f})")
        
        if res['macro_f1'] > best_f1:
            best_f1 = res['macro_f1']
            best_model_name = name
            best_model = model
            best_predictions = y_pred

    print(f"\nSelected Best Model (Cleaned): {best_model_name}")
    
    # Save artifacts for the best model
    model_dir = os.path.join(base_dir, 'models')
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(best_model, os.path.join(model_dir, 'disease_model.joblib'))
    preprocessor_clean.save_artifacts(model_dir)
    
    # Save metadata
    metadata = {
        "model_name": best_model_name,
        "trained_on": "Duplicate-cleaned dataset",
        "test_size": config['test_size'],
        "metrics": next(r for r in results_clean if r['model'] == best_model_name),
        "num_features": len(preprocessor_clean.feature_columns),
        "classes": preprocessor_clean.label_encoder.classes_.tolist()
    }
    with open(os.path.join(model_dir, 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=4)
        
    # Generate Outputs for Analytics
    eval_dir = os.path.join(base_dir, 'evaluation')
    os.makedirs(eval_dir, exist_ok=True)
    
    comparison = {
        "experiment_a_original": results_orig,
        "experiment_b_cleaned": results_clean
    }
    with open(os.path.join(eval_dir, 'model_metrics.json'), 'w') as f:
        json.dump(comparison, f, indent=4)
        
    # Confusion Matrix
    cm = confusion_matrix(y_test_clean, best_predictions)
    with open(os.path.join(eval_dir, 'confusion_matrix.json'), 'w') as f:
        json.dump(cm.tolist(), f)
        
    # Classification report
    report = classification_report(y_test_clean, best_predictions, target_names=preprocessor_clean.label_encoder.classes_, output_dict=True)
    with open(os.path.join(eval_dir, 'classification_report.json'), 'w') as f:
        json.dump(report, f, indent=4)
        
    # Feature Importance (if applicable)
    if hasattr(best_model, 'feature_importances_'):
        importances = best_model.feature_importances_
        feat_imp = sorted(zip(preprocessor_clean.feature_columns, importances), key=lambda x: x[1], reverse=True)
        with open(os.path.join(eval_dir, 'feature_importance.json'), 'w') as f:
            json.dump([{"feature": f, "importance": float(i)} for f, i in feat_imp], f, indent=4)
            
    # Visualizations
    plots_dir = os.path.join(eval_dir, 'plots')
    os.makedirs(plots_dir, exist_ok=True)
    
    # Plot Model Comparison (Macro F1)
    orig_f1s = [r['macro_f1'] for r in results_orig]
    clean_f1s = [r['macro_f1'] for r in results_clean]
    labels = [r['model'] for r in results_clean]
    
    x = np.arange(len(labels))
    width = 0.35
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.bar(x - width/2, orig_f1s, width, label='Original')
    ax.bar(x + width/2, clean_f1s, width, label='Cleaned')
    ax.set_ylabel('Macro F1 Score')
    ax.set_title('Model Performance: Original vs Cleaned Dataset')
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=45)
    ax.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, 'model_comparison.png'))
    plt.close()
    
    print("Training pipeline completed. Artifacts saved.")

if __name__ == '__main__':
    run_experiment()
