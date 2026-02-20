import pickle
import numpy as np

class DummyModel:
    def predict(self, features):
        # features is a 2D array, we just do a simplistic check for dummy purposes
        # e.g., if the sum of features is greater than a threshold, predict 1 (fraud), else 0
        return np.array([sum(features[0]) > 1000])

def train_dummy_model():
    model = DummyModel()
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)
    print("Dummy model saved.")

def load_model():
    with open('model.pkl', 'rb') as f:
        return pickle.load(f)

if __name__ == '__main__':
    train_dummy_model()
