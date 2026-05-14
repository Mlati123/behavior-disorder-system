from pydantic import BaseModel
from typing import Optional


class Resident(BaseModel):
    full_name: str
    age: int
    gender: str
    diagnosis: Optional[str] = None
    progress: Optional[str] = "Initial"
    is_discharged: Optional[bool] = False
    discharge_date: Optional[str] = None