from pydantic import BaseModel
from typing import List, Optional

class MedicineItem(BaseModel):
    name: str
    dosage: Optional[str] = ""
    frequency: Optional[str] = ""
    duration: Optional[str] = ""
    instructions: Optional[str] = ""

class AnalysisResponse(BaseModel):
    success: bool
    imageUrl: str
    medicines: List[MedicineItem]
    tests: List[str]
    ultrasounds: List[str]
    precautions: List[str]
    confidence_score: float = 100.0
    is_blurry: bool = False
    blur_variance: float = 0.0
    ocr_text_extracted: str = ""
    error: Optional[str] = None
