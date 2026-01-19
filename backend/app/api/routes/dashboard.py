"""
Dashboard API routes
"""
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import MetricsResponse, StateData, DistrictData
from app.core.database import db

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics():
    """Get overall system metrics"""
    try:
        query = """
        WITH enrollment_total AS (
            SELECT SUM(age_0_5 + age_5_17 + age_18_greater) as total
            FROM enrollment
        ),
        bio_total AS (
            SELECT SUM(bio_age_5_17 + bio_age_17_) as total
            FROM biometric_updates
        ),
        demo_total AS (
            SELECT SUM(demo_age_5_17 + demo_age_17_) as total
            FROM demographic_updates
        ),
        crisis_count AS (
            SELECT COUNT(DISTINCT district) as count
            FROM (
                SELECT 
                    e.state,
                    e.district,
                    SUM(e.age_0_5 + e.age_5_17 + e.age_18_greater) as enrollments,
                    COALESCE((SELECT SUM(bio_age_5_17 + bio_age_17_) 
                              FROM biometric_updates b 
                              WHERE b.state = e.state AND b.district = e.district), 0) as bio_updates,
                    ROUND(COALESCE((SELECT SUM(bio_age_5_17 + bio_age_17_) 
                                    FROM biometric_updates b 
                                    WHERE b.state = e.state AND b.district = e.district)::numeric / 
                          NULLIF(SUM(e.age_0_5 + e.age_5_17 + e.age_18_greater), 0), 0), 2) as bio_ratio
                FROM enrollment e
                GROUP BY e.state, e.district
                HAVING SUM(e.age_0_5 + e.age_5_17 + e.age_18_greater) > 1000
            ) districts
            WHERE bio_ratio > 36.9  -- Simplified: >2 sigma threshold
        )
        SELECT 
            (SELECT total FROM enrollment_total) as total_enrollments,
            (SELECT total FROM bio_total) as total_bio_updates,
            (SELECT total FROM demo_total) as total_demo_updates,
            (SELECT count FROM crisis_count) as crisis_districts_count;
        """
        
        result = db.execute_query(query)
        
        if not result:
            raise HTTPException(status_code=500, detail="Failed to fetch metrics")
        
        data = result[0]
        
        return MetricsResponse(
            total_enrollments=int(data['total_enrollments'] or 0),
            total_bio_updates=int(data['total_bio_updates'] or 0),
            total_demo_updates=int(data['total_demo_updates'] or 0),
            national_bio_ratio=round(float(data['total_bio_updates'] or 0) / float(data['total_enrollments'] or 1), 2),
            national_demo_ratio=round(float(data['total_demo_updates'] or 0) / float(data['total_enrollments'] or 1), 2),
            crisis_districts_count=int(data['crisis_districts_count'] or 0)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/states", response_model=List[StateData])
async def get_state_rankings(limit: int = 20):
    """Get state rankings by biometric ratio"""
    try:
        query = f"""
        WITH enrollment_by_state AS (
            SELECT 
                state,
                SUM(age_0_5 + age_5_17 + age_18_greater) as total_enrollments
            FROM enrollment
            GROUP BY state
        ),
        biometric_by_state AS (
            SELECT 
                state,
                SUM(bio_age_5_17 + bio_age_17_) as total_biometric_updates
            FROM biometric_updates
            GROUP BY state
        )
        SELECT 
            e.state,
            e.total_enrollments as enrollments,
            COALESCE(b.total_biometric_updates, 0) as bio_updates,
            ROUND(COALESCE(b.total_biometric_updates::numeric / 
                  NULLIF(e.total_enrollments, 0), 0), 2) as bio_ratio
        FROM enrollment_by_state e
        LEFT JOIN biometric_by_state b ON e.state = b.state
        WHERE e.total_enrollments > 50000
        ORDER BY bio_ratio DESC
        LIMIT {limit};
        """
        
        results = db.execute_query(query)
        
        return [StateData(**row) for row in results]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/crisis-districts", response_model=List[DistrictData])
async def get_crisis_districts(limit: int = 30):
    """Get crisis districts (statistical outliers)"""
    try:
        query = f"""
        WITH district_ratios AS (
            SELECT 
                e.state,
                e.district,
                SUM(e.age_0_5 + e.age_5_17 + e.age_18_greater) as enrollments,
                COALESCE((SELECT SUM(bio_age_5_17 + bio_age_17_) 
                          FROM biometric_updates b 
                          WHERE b.state = e.state AND b.district = e.district), 0) as bio_updates,
                ROUND(COALESCE((SELECT SUM(bio_age_5_17 + bio_age_17_) 
                                FROM biometric_updates b 
                                WHERE b.state = e.state AND b.district = e.district)::numeric / 
                      NULLIF(SUM(e.age_0_5 + e.age_5_17 + e.age_18_greater), 0), 0), 2) as bio_ratio
            FROM enrollment e
            GROUP BY e.state, e.district
            HAVING SUM(e.age_0_5 + e.age_5_17 + e.age_18_greater) > 1000
        ),
        stats AS (
            SELECT 
                AVG(bio_ratio) as mean_ratio,
                STDDEV(bio_ratio) as stddev_ratio
            FROM district_ratios
        )
        SELECT 
            d.state,
            d.district,
            d.enrollments,
            d.bio_updates,
            d.bio_ratio,
            ROUND((d.bio_ratio - s.mean_ratio) / NULLIF(s.stddev_ratio, 0), 2) as z_score
        FROM district_ratios d
        CROSS JOIN stats s
        WHERE ABS((d.bio_ratio - s.mean_ratio) / NULLIF(s.stddev_ratio, 0)) > 2
        ORDER BY z_score DESC
        LIMIT {limit};
        """
        
        results = db.execute_query(query)
        
        return [DistrictData(**row) for row in results]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filters")
async def get_filter_options():
    """Get available filter options (states, districts)"""
    try:
        states_query = """
        SELECT DISTINCT state 
        FROM enrollment 
        ORDER BY state;
        """
        
        states = db.execute_query(states_query)
        
        return {
            "states": [row['state'] for row in states]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))