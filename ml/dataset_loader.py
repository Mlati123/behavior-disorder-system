import pandas as pd
from app.database import supabase


class DatasetLoader:

    def fetch_residents(self):
        data = supabase.table("residents").select("*").execute().data
        return pd.DataFrame(data if data else [])

    def fetch_assessments(self):
        data = supabase.table("behavioral_assessments").select("*").execute().data
        return pd.DataFrame(data if data else [])

    def build_dataset(self):

        residents = self.fetch_residents()
        assessments = self.fetch_assessments()

        if residents.empty:
            raise Exception("No residents found")

        if assessments.empty:
            raise Exception("No assessments found")

        residents["id"] = residents["id"].astype(str)
        assessments["resident_id"] = assessments["resident_id"].astype(str)

        data = pd.merge(
            assessments,
            residents,
            left_on="resident_id",
            right_on="id",
            how="inner"
        )

        if data.empty:
            raise Exception("Merge failed - check IDs")

        return data

    def create_features_and_labels(self):

        data = self.build_dataset()

        feature_cols = [
            "aggression_score",
            "anxiety_score",
            "depression_score",
            "hyperactivity_score",
            "social_withdrawal_score",
            "communication_score"
        ]

        X = data[feature_cols].fillna(0).astype(int)

        # =========================
        # AUTO LABEL GENERATION
        # =========================
        def generate_labels(row):

            labels = []

            if row["hyperactivity_score"] >= 2:
                labels.append("ADHD")

            if row["anxiety_score"] >= 2:
                labels.append("Anxiety Disorder")

            if row["social_withdrawal_score"] >= 2:
                labels.append("Autism")

            if row["depression_score"] >= 2:
                labels.append("Depression")

            if row["aggression_score"] >= 2:
                labels.append("Behavioral Disorder")

            return labels

        y = data.apply(generate_labels, axis=1)

        mask = y.apply(len) > 0
        y = y[mask]
        X = X.loc[mask]

        print("\nSAMPLE LABELS:")
        print(y.head(5))

        return X, y, data