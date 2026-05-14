import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from ml.multilabel_model import MultiLabelKNN


class MultiLabelTrainer:

    def train(self):

        df = pd.read_csv("ml/synthetic_dataset.csv")

        feature_cols = [
            "aggression",
            "hyperactivity",
            "anxiety",
            "social_withdrawal",
            "sleep_problems",
            "communication_difficulty",
            "repetitive_behavior",
            "emotional_instability"
        ]

        label_cols = [
            "label_anxiety",
            "label_aggression",
            "label_adhd",
            "label_sleep_disorder"
        ]

        X = df[feature_cols]

        y = df[label_cols]

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42
        )

        model = MultiLabelKNN(k=5)

        model.fit(X_train, y_train)

        predictions = model.predict(X_test)

        accuracy = accuracy_score(y_test, predictions)

        print(f"\nMulti-label Accuracy: {accuracy:.2f}")

        model.save()

        return model