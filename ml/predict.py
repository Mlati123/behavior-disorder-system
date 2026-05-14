import joblib
import pandas as pd


class Predictor:

    def __init__(self):
        self.model = joblib.load("ml/model.pkl")
        self.mlb = joblib.load("ml/mlb.pkl")

    def predict(self, data):

        features = pd.DataFrame([{
            "aggression": int(data.get("aggression", 0)),
            "hyperactivity": int(data.get("hyperactivity", 0)),
            "anxiety": int(data.get("anxiety", 0)),
            "social_withdrawal": int(data.get("social_withdrawal", 0)),
            "sleep_problems": int(data.get("sleep_problems", 0)),
            "communication_difficulty": int(data.get("communication_difficulty", 0)),
            "repetitive_behavior": int(data.get("repetitive_behavior", 0)),
            "emotional_instability": int(data.get("emotional_instability", 0)),
        }])

        prediction = self.model.predict(features)

        labels = self.mlb.inverse_transform(prediction)

        result = list(labels[0]) if labels else []

        if not result:
            return ["No disorder detected"]

        return result