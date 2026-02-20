from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import hashlib
import time

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.model import load_model, train_dummy_model

app = Flask(__name__)
CORS(app)

# Ensure a dummy model exists for startup
if not os.path.exists('ml/model.pkl'):
    train_dummy_model()

model = load_model()

def hash_prediction(prediction, timestamp):
    data_string = f"{prediction}_{timestamp}"
    return hashlib.sha256(data_string.encode()).hexdigest()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print("Received data:", data)
        # Expecting a simplified 'amount' feature for now
        amount = float(data.get('amount', 0))
        
        # In a real scenario, you'd extract many features here
        features = [[amount]]
        
        # Get ML prediction
        prediction = int(model.predict(features)[0])
        is_fraudulent = True if prediction == 1 else False
        
        # Create a hash of the prediction for the blockchain
        timestamp = str(int(time.time()))
        pred_hash = hash_prediction(is_fraudulent, timestamp)

        return jsonify({
            'success': True,
            'isFraudulent': is_fraudulent,
            'predictionHash': pred_hash,
            'timestamp': timestamp
        })
        
    except Exception as e:
        print("Error:", e)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
