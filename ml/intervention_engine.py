class InterventionEngine:

    def recommend(self, predictions):

        interventions = []

        # Anxiety
        if predictions.get("anxiety"):
            interventions.append({
                "condition": "anxiety",
                "recommendation": [
                    "Cognitive Behavioral Therapy (CBT)",
                    "Emotional support sessions",
                    "Stress reduction activities",
                    "Daily anxiety monitoring"
                ]
            })

        # Aggression
        if predictions.get("aggression"):
            interventions.append({
                "condition": "aggression",
                "recommendation": [
                    "Behavioral management therapy",
                    "Conflict de-escalation techniques",
                    "Structured routines",
                    "Close caregiver supervision"
                ]
            })

        # ADHD
        if predictions.get("adhd"):
            interventions.append({
                "condition": "adhd",
                "recommendation": [
                    "Attention improvement exercises",
                    "Structured classroom environment",
                    "Task scheduling",
                    "Behavioral coaching"
                ]
            })

        # Sleep Disorder
        if predictions.get("sleep_disorder"):
            interventions.append({
                "condition": "sleep_disorder",
                "recommendation": [
                    "Sleep hygiene program",
                    "Consistent bedtime routine",
                    "Reduce nighttime stimulation",
                    "Sleep monitoring"
                ]
            })

        # Stable Condition
        if not interventions:
            interventions.append({
                "condition": "stable",
                "recommendation": [
                    "Continue regular monitoring",
                    "Maintain healthy routines"
                ]
            })

        return interventions