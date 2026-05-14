import joblib
from sklearn.multiclass import OneVsRestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler


class MultiLabelKNN:

    def __init__(self, k=3):

        self.scaler = StandardScaler()

        self.model = OneVsRestClassifier(
            KNeighborsClassifier(n_neighbors=k)
        )

        self.is_trained = False

    def fit(self, X, y):

        X_scaled = self.scaler.fit_transform(X)

        self.model.fit(X_scaled, y)

        self.is_trained = True

    def predict(self, X):

        X_scaled = self.scaler.transform(X)

        return self.model.predict(X_scaled)

    def save(self):

        joblib.dump(
            {
                "model": self.model,
                "scaler": self.scaler
            },
            "ml/multilabel_knn.pkl"
        )

        print("Multi-label model saved")