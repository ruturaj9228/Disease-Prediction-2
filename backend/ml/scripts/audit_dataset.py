import pandas as pd
import json
import os

def audit_dataset():
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    train_path = os.path.join(data_dir, 'Training.csv')
    test_path = os.path.join(data_dir, 'Testing.csv')
    
    if not os.path.exists(train_path) or not os.path.exists(test_path):
        print("Dataset not found!")
        return

    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)
    
    # Remove accidental index column if exists (like 'Unnamed: 133')
    if 'Unnamed: 133' in train_df.columns:
        train_df = train_df.drop('Unnamed: 133', axis=1)
    if 'Unnamed: 133' in test_df.columns:
        test_df = test_df.drop('Unnamed: 133', axis=1)

    target_col = 'prognosis' if 'prognosis' in train_df.columns else train_df.columns[-1]
    
    symptom_cols = [c for c in train_df.columns if c != target_col]
    
    train_duplicates = train_df.duplicated().sum()
    train_unique = len(train_df) - train_duplicates
    
    audit = {
        'files': ['Training.csv', 'Testing.csv'],
        'train_rows': int(len(train_df)),
        'train_cols': int(len(train_df.columns)),
        'test_rows': int(len(test_df)),
        'target_column': target_col,
        'num_symptom_features': len(symptom_cols),
        'unique_diseases': int(train_df[target_col].nunique()),
        'missing_values': int(train_df.isnull().sum().sum()),
        'train_duplicate_rows': int(train_duplicates),
        'train_unique_rows': int(train_unique),
        'diseases': train_df[target_col].unique().tolist()
    }
    
    # Evaluate duplicate symptom patterns (ignoring prognosis)
    feature_patterns = train_df[symptom_cols]
    duplicate_patterns = feature_patterns.duplicated().sum()
    audit['duplicate_symptom_patterns'] = int(duplicate_patterns)
    audit['unique_symptom_patterns'] = int(len(feature_patterns) - duplicate_patterns)

    eval_dir = os.path.join(os.path.dirname(__file__), '..', 'evaluation')
    os.makedirs(eval_dir, exist_ok=True)
    with open(os.path.join(eval_dir, 'dataset_audit.json'), 'w') as f:
        json.dump(audit, f, indent=4)
        
    print(f"Audit completed. Found {audit['train_duplicate_rows']} duplicates in {audit['train_rows']} rows.")
    print(f"Unique rows: {audit['train_unique_rows']}")
    print(f"Unique symptom patterns: {audit['unique_symptom_patterns']}")

if __name__ == '__main__':
    audit_dataset()
