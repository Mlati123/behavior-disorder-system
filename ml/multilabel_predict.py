import joblib
import numpy as np


class MultiLabelPredictor:

    def __init__(self):

        saved = joblib.load("ml/multilabel_knn.pkl")

        self.model = saved["model"]
        self.scaler = saved["scaler"]

    def predict(self, input_data):

        features = [
            "aggression",
            "hyperactivity",
            "anxiety",
            "social_withdrawal",
            "sleep_problems",
            "communication_difficulty",
            "repetitive_behavior",
            "emotional_instability"
        ]

        X = np.array([
            [int(input_data.get(f, 0)) for f in features]
        ])

        X_scaled = self.scaler.transform(X)

        prediction = self.model.predict(X_scaled)[0]

        return {
            "anxiety": bool(prediction[0]),
            "aggression": bool(prediction[1]),
            "adhd": bool(prediction[2]),
            "sleep_disorder": bool(prediction[3])
        }