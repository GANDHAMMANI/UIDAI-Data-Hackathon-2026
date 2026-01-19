"""
AI Chat API routes
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.core.langchain_agent import langchain_agent
from app.core.chart_generator import chart_generator
from app.core.database import db

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process natural language question using LangChain SQL Agent
    
    Args:
        request: ChatRequest with user's question
        
    Returns:
        ChatResponse with answer and optional chart data
    """
    try:
        # Get response from LangChain agent
        result = langchain_agent.query(request.question)
        
        if not result['success']:
            return ChatResponse(
                success=False,
                answer="I encountered an error processing your question.",
                question=request.question,
                error=result.get('error', 'Unknown error')
            )
        
        answer = result['answer']
        
        # Try to extract data for chart generation
        # Check if answer contains data-like patterns
        chart_data = None
        
        try:
            # Attempt to re-query for structured data if answer suggests data
            if any(word in answer.lower() for word in ['district', 'state', 'ratio', 'top', 'highest']):
                # Extract potential SQL from agent's intermediate steps
                # This is a simplified approach - in production, you'd want more sophisticated parsing
                chart_data = attempt_chart_generation(request.question, answer)
        except Exception as e:
            print(f"Chart generation failed: {e}")
            # Continue without chart
        
        return ChatResponse(
            success=True,
            answer=answer,
            question=request.question,
            chart_data=chart_data
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def attempt_chart_generation(question: str, answer: str):
    """
    Attempt to generate chart data from question and answer
    
    This is a simplified version - in production, you'd extract
    the actual SQL results from LangChain's intermediate steps
    """
    try:
        # For now, return None - we'll enhance this later
        # The LangChain agent's intermediate steps contain the SQL and results
        # You'd need to modify langchain_agent.py to return those
        return None
    except:
        return None


@router.get("/test")
async def test_chat():
    """Test chat endpoint"""
    return {
        "status": "Chat endpoint working",
        "agent_ready": langchain_agent.agent is not None
    }