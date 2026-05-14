import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import supabase
from ml.predict import Predictor


# =========================
# FASTAPI INIT
# =========================
app = FastAPI()


# =========================
# CORS CONFIG
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# LOAD AI MODEL
# =========================
predictor = Predictor()


# =========================
# HOME ROUTE
# =========================
@app.get("/")
def home():
    return {
        "status": "API is running"
    }


# =========================
# HEALTH CHECK
# =========================
@app.get("/health")
def health():
    return {
        "status": "ok"
    }


# =========================
# GET ALL RESIDENTS
# =========================
@app.get("/residents")
def get_residents():

    try:

        data = (
            supabase
            .table("residents")
            .select("*")
            .execute()
        )

        return {
            "status": "success",
            "data": data.data
        }

    except Exception as e:

        print("ERROR:", e)

        return {
            "error": str(e)
        }


# =========================
# ADD RESIDENT
# =========================
@app.post("/add-resident")
def add_resident(resident: dict):

    try:

        # Build insert data with only the fields that exist
        insert_data = {
            "full_name": resident.get("full_name"),
            "gender": resident.get("gender"),
            "age": resident.get("age"),
            "diagnosis": resident.get("diagnosis", ""),
        }
        
        # Add optional fields if they exist in the table
        if resident.get("progress"):
            insert_data["progress"] = resident.get("progress")
        if resident.get("is_discharged") is not None:
            insert_data["is_discharged"] = resident.get("is_discharged")
        if resident.get("discharge_date"):
            insert_data["discharge_date"] = resident.get("discharge_date")

        try:
            data = (
                supabase
                .table("residents")
                .insert(insert_data)
                .execute()
            )
        except Exception as inner_err:
            error_text = str(inner_err)
            print("Add resident insert error:", error_text)

            # If optional columns are missing, retry with a smaller payload
            if "progress" in error_text or "is_discharged" in error_text or "discharge_date" in error_text:
                fallback_insert = {
                    "full_name": insert_data["full_name"],
                    "gender": insert_data["gender"],
                    "age": insert_data["age"],
                    "diagnosis": insert_data["diagnosis"],
                }
                if insert_data.get("status"):
                    fallback_insert["status"] = insert_data["status"]
                elif insert_data.get("progress"):
                    fallback_insert["status"] = insert_data["progress"]
                data = (
                    supabase
                    .table("residents")
                    .insert(fallback_insert)
                    .execute()
                )
            else:
                raise

        return {
            "status": "success",
            "message": "Resident added successfully",
            "data": data.data
        }

    except Exception as e:

        print("ERROR:", e)

        return {
            "status": "error",
            "error": str(e)
        }


# =========================
# ADD ASSESSMENT
# =========================
@app.post("/add-assessment")
def add_assessment(assessment: dict):

    try:

        data = (
            supabase
            .table("assessments")
            .insert(assessment)
            .execute()
        )

        return {
            "message": "Assessment added successfully",
            "data": data.data
        }

    except Exception as e:

        print("ERROR:", e)

        return {
            "error": str(e)
        }


# =========================
# AI PREDICTION + SAVE
# =========================
@app.post("/predict-disorder")
def predict_disorder(data: dict):

    try:

        # =========================
        # AI PREDICTION
        # =========================
        prediction = predictor.predict(data)

        # =========================
        # RISK SCORE ENGINE
        # =========================
        score = sum([
            int(data.get("aggression", False)),
            int(data.get("hyperactivity", False)),
            int(data.get("anxiety", False)),
            int(data.get("social_withdrawal", False)),
            int(data.get("sleep_problems", False)),
            int(data.get("communication_difficulty", False)),
            int(data.get("repetitive_behavior", False)),
            int(data.get("emotional_instability", False)),
        ])

        # =========================
        # RISK LEVELS & RECOMMENDATIONS
        # =========================
        if score <= 2:

            risk_level = "Low"

            interventions = [
                "Routine counselling",
                "Monitor behavior weekly",
                "Continue current treatment plan",
                "Encourage social engagement"
            ]

        elif score <= 5:

            risk_level = "Medium"

            interventions = [
                "Cognitive Behavioral Therapy",
                "Behavioral tracking",
                "Family counselling",
                "Increase monitoring frequency",
                "Structured daily activities"
            ]

        else:

            risk_level = "High"

            interventions = [
                "Psychiatric referral",
                "Intensive therapy",
                "Medication evaluation",
                "Continuous monitoring",
                "Crisis support plan",
                "Specialist consultation"
            ]

        # =========================
        # SAVE TO DATABASE
        # =========================
        (
            supabase
            .table("predictions")
            .insert({
                "resident_id": data.get("resident_id"),
                "prediction": str(prediction),
                "risk_level": risk_level,
                "interventions": json.dumps(interventions),
                "input_data": data
            })
            .execute()
        )

        # =========================
        # RETURN RESPONSE
        # =========================
        return {
            "status": "success",
            "prediction": prediction,
            "risk_level": risk_level,
            "recommended_intervention": interventions
        }

    except Exception as e:

        print("ERROR:", e)

        return {
            "error": str(e)
        }


# =========================
# GET PREDICTION HISTORY
# =========================
@app.get("/predictions")
def get_predictions():

    try:

        data = (
            supabase
            .table("predictions")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "status": "success",
            "data": data.data
        }

    except Exception as e:

        print("ERROR:", e)

        return {
            "error": str(e)
        }


# =========================
# UPDATE CLIENT PROGRESS
# =========================
@app.post("/update-progress")
def update_progress(data: dict):

    try:

        # =========================
        # BUILD UPDATE DATA
        # =========================
        update_data = {}
        
        if data.get("progress"):
            update_data["progress"] = data.get("progress")
            update_data["status"] = data.get("progress")
        if data.get("status"):
            update_data["status"] = data.get("status")
        if data.get("is_discharged") is not None:
            update_data["is_discharged"] = data.get("is_discharged")
        if data.get("is_discharged") and data.get("discharge_date"):
            update_data["discharge_date"] = data.get("discharge_date")
        elif data.get("is_discharged") is False:
            update_data["discharge_date"] = None

        # Only update if there's data to update
        if update_data:
            try:
                (
                    supabase
                    .table("residents")
                    .update(update_data)
                    .eq("id", data.get("resident_id"))
                    .execute()
                )
            except Exception as inner_err:
                err_text = str(inner_err)
                print("Update progress error:", err_text)
                if "discharge_date" in err_text or "is_discharged" in err_text or "progress" in err_text or "status" in err_text:
                    reduced_update = {}
                    if data.get("progress"):
                        reduced_update["status"] = data.get("progress")
                    if reduced_update:
                        (
                            supabase
                            .table("residents")
                            .update(reduced_update)
                            .eq("id", data.get("resident_id"))
                            .execute()
                        )
                else:
                    raise

        # =========================
        # DETERMINE NEXT STAGE RECOMMENDATION
        # =========================
        current_progress = data.get("progress", "Initial")
        
        progress_recommendations = {
            "Initial": {
                "stage": "Initial Assessment",
                "description": "Client in assessment phase",
                "recommendations": [
                    "Complete full diagnostic assessment",
                    "Establish baseline behavior measurements",
                    "Build therapeutic rapport",
                    "Educate family about condition"
                ],
                "next_stage": "Early",
                "estimated_duration": "2-4 weeks"
            },
            "Early": {
                "stage": "Early Treatment",
                "description": "Treatment has started, initial improvements showing",
                "recommendations": [
                    "Reinforce positive behaviors",
                    "Increase therapy frequency if needed",
                    "Monitor medication response",
                    "Involve family in treatment planning"
                ],
                "next_stage": "Intermediate",
                "estimated_duration": "4-8 weeks"
            },
            "Intermediate": {
                "stage": "Intermediate Progress",
                "description": "Significant improvement in behaviors",
                "recommendations": [
                    "Focus on skill generalization",
                    "Reduce supervision gradually",
                    "Plan for community integration",
                    "Document progress with standardized measures"
                ],
                "next_stage": "Advanced",
                "estimated_duration": "8-12 weeks"
            },
            "Advanced": {
                "stage": "Advanced Recovery",
                "description": "Major behavioral improvements, preparing for transition",
                "recommendations": [
                    "Plan discharge timeline",
                    "Coordinate with community resources",
                    "Train client for independence",
                    "Establish aftercare support"
                ],
                "next_stage": "Ready for Discharge",
                "estimated_duration": "1-2 weeks"
            },
            "Ready for Discharge": {
                "stage": "Discharge Ready",
                "description": "Client ready to transition out of program",
                "recommendations": [
                    "Complete discharge planning",
                    "Provide community resources",
                    "Schedule follow-up appointments",
                    "Transfer care to primary provider"
                ],
                "next_stage": "Discharge",
                "estimated_duration": "Immediate"
            }
        }

        stage_info = progress_recommendations.get(current_progress, progress_recommendations["Initial"])

        return {
            "status": "success",
            "message": "Progress updated successfully",
            "current_stage": stage_info,
            "data": {
                "resident_id": data.get("resident_id"),
                "progress": data.get("progress"),
                "is_discharged": data.get("is_discharged"),
                "discharge_date": data.get("discharge_date")
            }
        }

    except Exception as e:

        print("ERROR:", e)

        return {
            "error": str(e)
        }


# =========================
# GET PROGRESS RECOMMENDATIONS
# =========================
@app.get("/progress-recommendations/{resident_id}")
def get_progress_recommendations(resident_id: int):

    try:

        # Get resident data
        resident_data = (
            supabase
            .table("residents")
            .select("*")
            .eq("id", resident_id)
            .execute()
        )

        if not resident_data.data:
            return {"error": "Resident not found"}

        resident = resident_data.data[0]
        current_progress = resident.get("progress", "Initial")

        # Get latest prediction
        prediction_data = (
            supabase
            .table("predictions")
            .select("*")
            .eq("resident_id", resident_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        progress_stages = {
            "Initial": "Needs comprehensive assessment and baseline planning",
            "Early": "Beginning to respond to interventions, maintain consistency",
            "Intermediate": "Building skills and applying them in various settings",
            "Advanced": "Near independence, focus on maintenance and community transition",
            "Ready for Discharge": "Prepared for independent functioning with external support"
        }

        return {
            "status": "success",
            "resident_id": resident_id,
            "resident_name": resident.get("full_name"),
            "current_progress": current_progress,
            "progress_description": progress_stages.get(current_progress, "Unknown stage"),
            "latest_prediction": prediction_data.data[0] if prediction_data.data else None,
            "is_discharged": resident.get("is_discharged", False),
            "discharge_date": resident.get("discharge_date")
        }

    except Exception as e:

        print("ERROR:", e)

        return {
            "error": str(e)
        }