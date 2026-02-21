import pandas as pd
import numpy as np
import os

def generate_synthetic_fraud_data(num_samples=10000):
    np.random.seed(42)
    
    # Features commonly found in e-commerce fraud
    # 1. Transaction Amount (Safe transactions are usually smaller, Fraud can be exceptionally large or very small probing charges)
    amounts = np.random.exponential(scale=50, size=num_samples)
    
    # 2. Time of day (0-23 hours). Fraud often happens at odd hours (2 AM - 5 AM)
    txn_hour = np.random.randint(0, 24, size=num_samples)
    
    # 3. Time since last transaction (in minutes). Rapid successive transactions hint at fraud.
    time_since_last_txn = np.random.exponential(scale=1440, size=num_samples) # Average 1 day
    
    # 4. Location mismatch (0 = matching IP/Shipping, 1 = mismatch)
    location_mismatch = np.random.choice([0, 1], p=[0.9, 0.1], size=num_samples)
    
    # 5. Failed login attempts before transaction
    failed_logins = np.random.poisson(lam=0.1, size=num_samples)
    
    # Create DataFrame
    df = pd.DataFrame({
        'amount': amounts,
        'txn_hour': txn_hour,
        'time_since_last_txn': time_since_last_txn,
        'location_mismatch': location_mismatch,
        'failed_logins': failed_logins,
    })
    
    # Generate Labels based on a hidden rule (this makes the ML model have something to learn)
    # Fraud condition: Very high amount OR (mismatch + odd hour) OR rapid transactions with failed logins
    is_fraud = (
        (df['amount'] > 300) | 
        ((df['location_mismatch'] == 1) & (df['txn_hour'] >= 1) & (df['txn_hour'] <= 5)) |
        ((df['time_since_last_txn'] < 10) & (df['failed_logins'] > 0))
    ).astype(int)
    
    # Add some noise so it's not perfectly linearly separable
    noise = np.random.choice([0, 1], p=[0.98, 0.02], size=num_samples)
    df['is_fraud'] = np.abs(is_fraud - noise) # Flip 2% of labels randomly
    
    print(f"Dataset generated. Total rows: {num_samples}")
    print(f"Fraud cases: {df['is_fraud'].sum()} ({df['is_fraud'].mean()*100:.2f}%)")
    
    # Save to CSV
    os.makedirs('backend/ml/dataset', exist_ok=True)
    df.to_csv('backend/ml/dataset/ecommerce_fraud.csv', index=False)
    print("Saved to backend/ml/dataset/ecommerce_fraud.csv")

if __name__ == "__main__":
    generate_synthetic_fraud_data()
