import joblib
import pandas as pd

from sklearn.multiclass import OneVsRestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import MultiLabelBinarizer

# =========================
# LOAD YOUR CSV (FIXED NAME)
# =========================
df = pd.read_csv("ml/synthetic_dataset.csv")

# =========================
# FEATURES
# =========================
X = df[
    [
        "aggression",
        "hyperactivity",
        "anxiety",
        "social_withdrawal",
        "sleep_problems",
        "communication_difficulty",
        "repetitive_behavior",
        "emotional_instability"
    ]
].fillna(0)

# =========================
# BUILD MULTILABEL TARGETS
# =========================
def build_labels(row):
    labels = []

    if row["label_anxiety"] == 1:
        labels.append("Anxiety Disorder")

    if row["label_aggression"] == 1:
        labels.append("Behavioral Disorder")

    if row["label_adhd"] == 1:
        labels.append("ADHD")

    if row["label_sleep_disorder"] == 1:
        labels.append("Sleep Disorder")

    return labels

y = df.apply(build_labels, axis=1)

# remove empty rows (VERY IMPORTANT)
mask = y.apply(len) > 0
X = X[mask]
y = y[mask]

# =========================
# ENCODE LABELS
# =========================
mlb = MultiLabelBinarizer()
y_encoded = mlb.fit_transform(y)

# =========================
# MODEL (STABLE MULTILABEL)
# =========================
model = OneVsRestClassifier(
    LogisticRegression(max_iter=1000)
)

model.fit(X, y_encoded)

# =========================
# SAVE MODEL
# =========================
joblib.dump(model, "ml/model.pkl")
joblib.dump(mlb, "ml/mlb.pkl")

print("✅ MULTILABEL MODEL TRAINED SUCCESSFULLY")
print("CLASSES:", mlb.classes_)