import random
import pandas as pd


def generate_sample():

    anxiety = random.choice([0, 1])
    aggression = random.choice([0, 1])
    adhd = random.choice([0, 1])
    sleep_disorder = random.choice([0, 1])

    return {

        # FEATURES
        "aggression": aggression,
        "hyperactivity": random.choice([0, 1]),
        "anxiety": anxiety,
        "social_withdrawal": random.choice([0, 1]),
        "sleep_problems": sleep_disorder,
        "communication_difficulty": random.choice([0, 1]),
        "repetitive_behavior": random.choice([0, 1]),
        "emotional_instability": random.choice([0, 1]),

        # MULTI-LABEL TARGETS
        "label_anxiety": anxiety,
        "label_aggression": aggression,
        "label_adhd": adhd,
        "label_sleep_disorder": sleep_disorder
    }


def generate_dataset(n=1000):

    data = [generate_sample() for _ in range(n)]

    return pd.DataFrame(data)


if __name__ == "__main__":

    df = generate_dataset(1000)

    df.to_csv("ml/synthetic_dataset.csv", index=False)

    print("Multi-label synthetic dataset created")