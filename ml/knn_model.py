import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler


class AdaptiveKNN:
    def __init__(self, k=3):
        self.k = k
        self.model = KNeighborsClassifier(n_neighbors=k)
        self.scaler = StandardScaler()
        self.is_trained = False

    def fit(self, X, y):
        """
        Train the model using feature matrix X and labels y
        """

        # Safety check for small datasets
        if len(X) < self.k:
            self.k = max(1, len(X))
            self.model = KNeighborsClassifier(n_neighbors=self.k)

        X_scaled = self.scaler.fit_transform(X)

        self.model.fit(X_scaled, y)

        self.is_trained = True

        print(f"\nModel trained successfully with k={self.k}")
        print(f"Training samples: {len(X)}")

    def predict(self, X):
        """
        Predict labels for new data
        """

        if not self.is_trained:
            raise Exception("Model not trained yet")

        X_scaled = self.scaler.transform(X)

        return self.model.predict(X_scaled)

    def predict_proba(self, X):
        """
        Get probability distribution
        """

        if not self.is_trained:
            raise Exception("Model not trained yet")

        X_scaled = self.scaler.transform(X)

        return self.model.predict_proba(X_scaled)