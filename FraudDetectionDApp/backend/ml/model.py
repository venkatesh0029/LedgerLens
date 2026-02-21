import pickle
import numpy as np
import os

class FraudModel:
    def __init__(self):
        self.model = None
        self.feature_means = None
        self._load_model_data()
        
    def _load_model_data(self):
        model_path = os.path.join(os.path.dirname(__file__), 'saved_models', 'isolation_forest.pkl')
        means_path = os.path.join(os.path.dirname(__file__), 'saved_models', 'feature_means.pkl')
        
        if os.path.exists(model_path) and os.path.exists(means_path):
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            with open(means_path, 'rb') as f:
                self.feature_means = pickle.load(f)
        else:
            print("Warning: Isolation Forest model files not found. Please run train.py first.")

    def predict(self, amount):
        if not self.model or not self.feature_means:
            # Fallback to dummy prediction if model isn't built yet
            return 0 if amount <= 1000 else 1 
            
        # Reconstruct exactly the 29 features expected by the model (V1-V28, Amount)
        # IsolationForest returns -1 for outliers/fraud, and 1 for inliers/safe
        features = []
        for i in range(1, 29):
            features.append(self.feature_means[f'V{i}'])
        
        # Add the actual amount from the user
        features.append(float(amount))
        
        # Predict requires a 2D array
        pred = self.model.predict([features])[0]
        
        # Return 1 for Fraud, 0 for Safe (sk-learn IF returns -1 for fraud)
        return 1 if pred == -1 else 0

def load_model():
    return FraudModel()

# The train script is no longer run from here, use train.py

