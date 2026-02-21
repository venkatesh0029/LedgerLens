import pandas as pd
from sklearn.ensemble import IsolationForest
import pickle
import os
import time

def train_isolation_forest():
    # Use absolute path to the dataset
    dataset_path = r"d:\Projects\InputAssets\cc-dataset\creditcard.csv"
    
    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}")
        return

    print("Loading dataset...")
    df = pd.read_csv(dataset_path)
    
    # We use V1-V28 and Amount. We drop Time and Class for training the unsupervised model
    features = df.drop(columns=['Time', 'Class'])
    
    print("Training Isolation Forest (this might take a minute)...")
    start_time = time.time()
    
    # Isolation Forest: contamination is the expected proportion of outliers (fraud)
    # The dataset has ~0.17% fraud, we use 0.002
    model = IsolationForest(n_estimators=100, contamination=0.002, random_state=42, n_jobs=-1)
    model.fit(features)
    
    print(f"Training completed in {time.time() - start_time:.2f} seconds.")
    
    # Save the model
    os.makedirs('saved_models', exist_ok=True)
    with open('saved_models/isolation_forest.pkl', 'wb') as f:
        pickle.dump(model, f)
        
    # We also need to save the 'mean' of the V1-V28 features. 
    # Because our DApp UI only asks the user for "Amount", the Flask API needs to pad the other 28 features 
    # with average values so the model has the correct number of inputs to make a prediction.
    feature_means = features.drop(columns=['Amount']).mean().to_dict()
    with open('saved_models/feature_means.pkl', 'wb') as f:
        pickle.dump(feature_means, f)
        
    print("Model and feature means saved successfully to backend/ml/saved_models/")

if __name__ == "__main__":
    train_isolation_forest()
