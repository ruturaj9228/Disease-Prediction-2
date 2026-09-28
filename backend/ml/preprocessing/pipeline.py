import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import joblib
import os

class DataPreprocessor:
    def __init__(self, data_dir=None):
        if data_dir is None:
            data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        self.data_dir = data_dir
        self.label_encoder = LabelEncoder()
        self.feature_columns = None
        self.target_column = 'prognosis'

    def load_data(self, filename='Training.csv', remove_duplicates=False):
        file_path = os.path.join(self.data_dir, filename)
        df = pd.read_csv(file_path)
        
        # Remove accidental index columns
        if 'Unnamed: 133' in df.columns:
            df = df.drop('Unnamed: 133', axis=1)
            
        # Clean column names (strip spaces)
        df.columns = df.columns.str.strip()
        
        # Handle target column
        if self.target_column not in df.columns:
            # Assume last column is target if not named prognosis
            self.target_column = df.columns[-1]
            
        # Remove duplicates if requested
        if remove_duplicates:
            df = df.drop_duplicates(keep='first')
            
        # Fill missing values with 0 for symptoms (assuming binary absent)
        df = df.fillna(0)
        
        return df

    def fit_transform(self, df):
        # Set feature columns explicitly to maintain order
        self.feature_columns = [c for c in df.columns if c != self.target_column]
        
        # Validate binary values (should be 0 or 1)
        # Assuming we just clip them or ensure they are integers
        X = df[self.feature_columns].astype(int).clip(0, 1)
        
        y = self.label_encoder.fit_transform(df[self.target_column])
        
        return X, y

    def transform(self, df):
        # Ensure we use exactly the feature columns in the exact order
        missing_cols = set(self.feature_columns) - set(df.columns)
        for c in missing_cols:
            df[c] = 0
            
        X = df[self.feature_columns].astype(int).clip(0, 1)
        y = self.label_encoder.transform(df[self.target_column])
        
        return X, y

    def save_artifacts(self, model_dir):
        os.makedirs(model_dir, exist_ok=True)
        joblib.dump(self.label_encoder, os.path.join(model_dir, 'label_encoder.joblib'))
        joblib.dump(self.feature_columns, os.path.join(model_dir, 'feature_columns.joblib'))
        
    def load_artifacts(self, model_dir):
        self.label_encoder = joblib.load(os.path.join(model_dir, 'label_encoder.joblib'))
        self.feature_columns = joblib.load(os.path.join(model_dir, 'feature_columns.joblib'))
