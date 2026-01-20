"""
AI Chat API routes
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.core.langchain_agent import langchain_agent
from app.core.chart_generator import format_for_chart, should_generate_chart
from app.core.database import db

router = APIRouter(prefix="/api/chat", tags=["chat"])



def _get_chart_data_for_question(question: str) -> list:
    """
    Extract chartable data based on question type
    Pattern matching for common chart queries
    
    Args:
        question: User's question
        
    Returns:
        list: List of dicts with chart data, or None
    """
    # db is already imported globally from app.core.database
    
    question_lower = question.lower()
    
    print(f"🔍 DEBUG: Analyzing question: '{question}'")
    print(f"🔍 DEBUG: Question lower: '{question_lower}'")
    
    try:
        # PATTERN 1: Compare specific states
        if 'compare' in question_lower:
            print("✓ DEBUG: 'compare' keyword found!")
            
            states_to_compare = []
            
            # Extract state names from question
            all_states = [
                'Maharashtra', 'Punjab', 'Andhra Pradesh', 'Chhattisgarh',
                'Tamil Nadu', 'Kerala', 'Karnataka', 'Gujarat', 'Rajasthan',
                'Uttar Pradesh', 'Bihar', 'West Bengal', 'Madhya Pradesh',
                'Odisha', 'Telangana', 'Haryana', 'Delhi', 'Jharkhand',
                'Assam', 'Jammu and Kashmir', 'Uttarakhand', 'Himachal Pradesh',
                'Tripura', 'Meghalaya', 'Manipur', 'Nagaland', 'Goa', 'Arunachal Pradesh',
                'Mizoram', 'Sikkim', 'Chandigarh', 'Puducherry'
            ]
            
            for state in all_states:
                if state.lower() in question_lower:
                    states_to_compare.append(state)
                    print(f"✓ DEBUG: Found state: {state}")
            
            print(f"🔍 DEBUG: States to compare: {states_to_compare}")
            
            if len(states_to_compare) >= 2:
                print("✓ DEBUG: Executing comparison query...")
                # Compare multiple states
                states_list = "', '".join(states_to_compare)
                query = f"""
                SELECT state, ROUND(AVG(bio_ratio), 2) as avg_bio_ratio
                FROM district_summary
                WHERE state IN ('{states_list}')
                  AND total_enrollments > 1000
                GROUP BY state
                ORDER BY avg_bio_ratio DESC
                """
                print(f"🔍 DEBUG: Query:\n{query}")
                
                results = db.execute_query(query)
                print(f"✓ DEBUG: Query returned {len(results) if results else 0} rows")
                print(f"🔍 DEBUG: Raw results: {results}")
                
                if results and len(results) > 0:
                    # Access by dict keys, not indices
                    chart_data = [{'state': r['state'], 'avg_bio_ratio': float(r['avg_bio_ratio'])} for r in results]
                    print(f"✓ DEBUG: Chart data prepared: {chart_data}")
                    return chart_data
                else:
                    print("⚠ DEBUG: Query returned no results!")
                    return None
            else:
                print(f"⚠ DEBUG: Not enough states found (need ≥2, got {len(states_to_compare)})")
        
        # PATTERN 2: Top/Bottom N crisis districts
        if any(word in question_lower for word in ['top', 'worst', 'crisis']):
            print("✓ DEBUG: 'top/worst/crisis' keyword found!")
            
            # Extract number
            limit = 10  # default
            if 'top 5' in question_lower or 'top five' in question_lower:
                limit = 5
            elif 'top 15' in question_lower or 'top fifteen' in question_lower:
                limit = 15
            elif 'top 20' in question_lower or 'top twenty' in question_lower:
                limit = 20
            
            print(f"🔍 DEBUG: Limit set to {limit}")
            
            query = f"""
            WITH stats AS (
              SELECT AVG(bio_ratio) as mean_ratio, STDDEV(bio_ratio) as stddev_ratio
              FROM district_summary WHERE total_enrollments > 1000
            )
            SELECT 
              d.district || ', ' || d.state as location,
              d.bio_ratio,
              ROUND((d.bio_ratio - s.mean_ratio) / s.stddev_ratio, 2) as z_score
            FROM district_summary d
            CROSS JOIN stats s
            WHERE d.total_enrollments > 1000
              AND (d.bio_ratio - s.mean_ratio) / s.stddev_ratio > 2
            ORDER BY z_score DESC
            LIMIT {limit}
            """
            print(f"🔍 DEBUG: Query:\n{query}")
            
            results = db.execute_query(query)
            print(f"✓ DEBUG: Query returned {len(results) if results else 0} rows")
            
            if results and len(results) > 0:
                # Access by dict keys
                chart_data = [{'location': r['location'], 'bio_ratio': float(r['bio_ratio']), 'z_score': float(r['z_score'])} for r in results]
                print(f"✓ DEBUG: Chart data prepared with {len(chart_data)} items")
                return chart_data
            else:
                print("⚠ DEBUG: Query returned no results!")
                return None
        
        # PATTERN 3: States with most crisis districts
        if 'state' in question_lower and any(word in question_lower for word in ['most', 'crisis', 'many']):
            print("✓ DEBUG: 'state + most/crisis/many' keyword found!")
            
            query = """
            WITH stats AS (
              SELECT AVG(bio_ratio) as mean_ratio, STDDEV(bio_ratio) as stddev_ratio
              FROM district_summary WHERE total_enrollments > 1000
            )
            SELECT 
              d.state,
              COUNT(*) as crisis_count,
              ROUND(AVG(d.bio_ratio), 2) as avg_ratio
            FROM district_summary d
            CROSS JOIN stats s
            WHERE d.total_enrollments > 1000
              AND (d.bio_ratio - s.mean_ratio) / s.stddev_ratio > 2
            GROUP BY d.state
            HAVING COUNT(*) > 0
            ORDER BY crisis_count DESC
            LIMIT 10
            """
            print(f"🔍 DEBUG: Query:\n{query}")
            
            results = db.execute_query(query)
            print(f"✓ DEBUG: Query returned {len(results) if results else 0} rows")
            
            if results and len(results) > 0:
                # Access by dict keys
                chart_data = [{'state': r['state'], 'crisis_count': int(r['crisis_count']), 'avg_ratio': float(r['avg_ratio'])} for r in results]
                print(f"✓ DEBUG: Chart data prepared with {len(chart_data)} items")
                return chart_data
            else:
                print("⚠ DEBUG: Query returned no results!")
                return None
        
        # PATTERN 4: Specific state's districts
        for state in ['Maharashtra', 'Punjab', 'Andhra Pradesh', 'Chhattisgarh', 
                      'Tamil Nadu', 'Kerala', 'Karnataka', 'Gujarat', 'Rajasthan',
                      'Uttar Pradesh', 'Bihar', 'West Bengal']:
            if state.lower() in question_lower and 'district' in question_lower:
                print(f"✓ DEBUG: Found state '{state}' + 'district' keyword!")
                
                query = f"""
                WITH stats AS (
                  SELECT AVG(bio_ratio) as mean_ratio, STDDEV(bio_ratio) as stddev_ratio
                  FROM district_summary WHERE total_enrollments > 1000
                )
                SELECT 
                  d.district,
                  d.bio_ratio,
                  ROUND((d.bio_ratio - s.mean_ratio) / s.stddev_ratio, 2) as z_score
                FROM district_summary d
                CROSS JOIN stats s
                WHERE d.state = '{state}'
                  AND d.total_enrollments > 1000
                  AND (d.bio_ratio - s.mean_ratio) / s.stddev_ratio > 2
                ORDER BY z_score DESC
                LIMIT 10
                """
                print(f"🔍 DEBUG: Query:\n{query}")
                
                results = db.execute_query(query)
                print(f"✓ DEBUG: Query returned {len(results) if results else 0} rows")
                
                if results and len(results) > 0:
                    # Access by dict keys
                    chart_data = [{'district': r['district'], 'bio_ratio': float(r['bio_ratio']), 'z_score': float(r['z_score'])} for r in results]
                    print(f"✓ DEBUG: Chart data prepared with {len(chart_data)} items")
                    return chart_data
        
        # PATTERN 5: Best/lowest performing states or districts
        if any(word in question_lower for word in ['best', 'lowest', 'good', 'performing well']):
            print("✓ DEBUG: 'best/lowest/good' keyword found!")
            
            query = """
            SELECT state, ROUND(AVG(bio_ratio), 2) as avg_bio_ratio
            FROM district_summary
            WHERE total_enrollments > 1000
            GROUP BY state
            HAVING AVG(bio_ratio) < 15
            ORDER BY avg_bio_ratio ASC
            LIMIT 10
            """
            print(f"🔍 DEBUG: Query:\n{query}")
            
            results = db.execute_query(query)
            print(f"✓ DEBUG: Query returned {len(results) if results else 0} rows")
            
            if results and len(results) > 0:
                # Access by dict keys
                chart_data = [{'state': r['state'], 'avg_bio_ratio': float(r['avg_bio_ratio'])} for r in results]
                print(f"✓ DEBUG: Chart data prepared with {len(chart_data)} items")
                return chart_data
            else:
                print("⚠ DEBUG: Query returned no results!")
                return None
        
        # PATTERN 6: Show all states ranking
        if 'all states' in question_lower or 'state ranking' in question_lower:
            print("✓ DEBUG: 'all states' or 'state ranking' keyword found!")
            
            query = """
            SELECT state, ROUND(AVG(bio_ratio), 2) as avg_bio_ratio
            FROM district_summary
            WHERE total_enrollments > 1000
            GROUP BY state
            ORDER BY avg_bio_ratio DESC
            LIMIT 20
            """
            print(f"🔍 DEBUG: Query:\n{query}")
            
            results = db.execute_query(query)
            print(f"✓ DEBUG: Query returned {len(results) if results else 0} rows")
            
            if results and len(results) > 0:
                # Access by dict keys
                chart_data = [{'state': r['state'], 'avg_bio_ratio': float(r['avg_bio_ratio'])} for r in results]
                print(f"✓ DEBUG: Chart data prepared with {len(chart_data)} items")
                return chart_data
            else:
                print("⚠ DEBUG: Query returned no results!")
                return None
        
        # No pattern matched
        print(f"⚠ DEBUG: No chart pattern matched for: '{question[:50]}...'")
        return None
        
    except Exception as e:
        print(f"✗ ERROR in _get_chart_data_for_question: {e}")
        import traceback
        traceback.print_exc()
        return None

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """AI chat endpoint with dynamic chart generation"""
    try:
        # Get question
        question = request.question
        
        print("=" * 60)
        print(f"📥 CHAT REQUEST RECEIVED")
        print(f"Question: {question}")
        print("=" * 60)
        
        # Query LangChain
        result = langchain_agent.query(question)
        
        if not result["success"]:
            print(f"✗ LangChain query failed: {result.get('answer', 'Unknown error')}")
            return ChatResponse(
                success=False,
                answer="",
                question=question,
                error=result.get("answer", "Unknown error")
            )
        
        print(f"✓ LangChain query successful")
        
        answer = result["answer"]
        chart_data = None
        
        # ALWAYS try to generate chart
        print(f"\n🎨 ATTEMPTING CHART GENERATION...")
        print(f"Calling _get_chart_data_for_question('{question}')")
        
        try:
            chart_query_result = _get_chart_data_for_question(question)
            
            print(f"\n📊 Chart query result type: {type(chart_query_result)}")
            print(f"📊 Chart query result: {chart_query_result}")
            
            if chart_query_result and len(chart_query_result) > 0:
                print(f"✓ Got chart data with {len(chart_query_result)} items")
                print(f"Calling format_for_chart()...")
                
                chart_data = format_for_chart(question, chart_query_result)
                
                print(f"✓ Chart formatted successfully!")
                print(f"Chart data type: {type(chart_data)}")
                print(f"Chart data keys: {chart_data.keys() if chart_data else 'None'}")
            else:
                print(f"⚠ No chart data returned (result was None or empty)")
                
        except Exception as e:
            print(f"✗ Chart generation EXCEPTION: {e}")
            import traceback
            print("Stack trace:")
            traceback.print_exc()
        
        print(f"\n📤 PREPARING RESPONSE:")
        print(f"   Answer length: {len(answer)} chars")
        print(f"   Chart data: {'YES' if chart_data else 'NO'}")
        print("=" * 60)
        
        return ChatResponse(
            success=True,
            answer=answer,
            question=question,
            chart_data=chart_data
        )
        
    except Exception as e:
        print(f"\n✗ CHAT ENDPOINT ERROR: {e}")
        import traceback
        traceback.print_exc()
        return ChatResponse(
            success=False,
            answer="",
            question=request.question,
            error=str(e)
        )



@router.get("/test")
async def test_chat():
    """Test chat endpoint"""
    return {
        "status": "Chat endpoint working",
        "agent_ready": langchain_agent.agent is not None
    }