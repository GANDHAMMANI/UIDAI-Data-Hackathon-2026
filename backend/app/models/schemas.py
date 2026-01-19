"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ChatRequest(BaseModel):
    """Chat request model"""
    question: str = Field(..., min_length=1, description="User's question")


class ChatResponse(BaseModel):
    """Chat response model"""
    success: bool
    answer: str
    question: str
    chart_data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class MetricsResponse(BaseModel):
    """Dashboard metrics response"""
    total_enrollments: int
    total_bio_updates: int
    total_demo_updates: int
    national_bio_ratio: float
    national_demo_ratio: float
    crisis_districts_count: int


class StateData(BaseModel):
    """State performance data"""
    state: str
    enrollments: int
    bio_updates: int
    bio_ratio: float


class DistrictData(BaseModel):
    """District performance data"""
    state: str
    district: str
    enrollments: int
    bio_updates: int
    bio_ratio: float
    z_score: Optional[float] = None


class HealthResponse(BaseModel):
    """API health check response"""
    status: str
    database: bool
    langchain: bool