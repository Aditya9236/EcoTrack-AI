from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class CalculateRequest(BaseModel):
    miles_driven: float = Field(ge=0.0, description="Miles driven in a week")
    fuel_type: str = Field(description="Fuel type: gasoline, diesel, hybrid, electric")
    kwh_electricity: float = Field(ge=0.0, description="Monthly household electricity consumption in kWh")
    heating_source: str = Field(description="Heating source: natural_gas, electricity, fuel_oil, none")
    meat_meals_per_week: int = Field(ge=0, description="Number of meals containing meat per week")
    waste_recycled_percentage: int = Field(ge=0, le=100, description="Percentage of waste recycled (0-100)")

class CalculateResponse(BaseModel):
    total_co2: float
    breakdown: Dict[str, float]

class CarbonRecordBreakdown(BaseModel):
    transportation: float
    electricity: float
    food: float
    waste: float

class HistoryEntry(BaseModel):
    date: str
    total_co2: float
    breakdown: CarbonRecordBreakdown

class UserPreferences(BaseModel):
    persona: str
    dietPreference: str
    electricitySource: Optional[str] = "standard"
    primaryTransport: Optional[str] = "car"

class RecommendRequest(BaseModel):
    history: List[HistoryEntry]
    preferences: UserPreferences

class RecommendationItem(BaseModel):
    category: str
    action: str
    impact_level: str
    xp_reward: int
    co2_offset_kg: float

class RecommendResponse(BaseModel):
    major_contributors: List[str]
    insights: str
    recommendations: List[RecommendationItem]

class GoalRequest(BaseModel):
    high_emissions_category: str
    user_level: int = Field(ge=1, default=1)

class GoalResponse(BaseModel):
    challenge_id: str
    title: str
    description: str
    target_value: int
    xp_bonus: int

class PredictRequest(BaseModel):
    current_annual_baseline: float = Field(ge=0.0, description="Total annual footprint in kg CO2e")
    target_reduction_percentage: float = Field(ge=0.0, le=100.0, description="Desired reduction percentage")

class PredictionInterval(BaseModel):
    expected: float
    savings: float

class PredictResponse(BaseModel):
    predictions: Dict[str, PredictionInterval]

class ScanResponse(BaseModel):
    doc_type: str
    consumption_value: float
    unit: str
    extracted_date: str
