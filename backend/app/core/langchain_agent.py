"""
LangChain SQL Agent with Groq
"""
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from langchain_groq import ChatGroq
from app.config import settings


class LangChainAgent:
    """LangChain SQL Agent for natural language to SQL"""
    
    def __init__(self):
        self.db = None
        self.agent = None
        self._initialize()
    
    def _initialize(self):
        """Initialize LangChain SQL Agent"""
        try:
            # Connect to database
            self.db = SQLDatabase.from_uri(settings.DATABASE_URL)
            
            # Initialize Groq LLM
            llm = ChatGroq(
                api_key=settings.GROQ_API_KEY,
                model_name=settings.GROQ_MODEL,
                temperature=0,
                max_tokens=2000  # Increased for complex queries
            )
            
            # Create SQL Agent with custom prompt
            self.agent = create_sql_agent(
                llm=llm,
                db=self.db,
                agent_type="openai-tools",
                verbose=settings.DEBUG,
                handle_parsing_errors=True,
                prefix="""
    You are an expert data analyst for UIDAI Aadhaar system.

    Database contains 3 tables:
    1. enrollment: New Aadhaar enrollments (state, district, pincode, age groups, date)
    2. biometric_updates: Biometric revalidations (state, district, pincode, age groups, date)
    3. demographic_updates: Demographic changes (state, district, pincode, age groups, date)

    IMPORTANT CONCEPTS:
    - "Crisis districts" or "urgent attention" = High bio_ratio
    - bio_ratio = (total biometric updates) / (total enrollments)
    - High ratio means repeated failures/multiple attempts
    - National average bio_ratio is ~15.8
    - Districts with ratio >30 need urgent attention

    ALWAYS:
    - Group by state/district when analyzing performance
    - Calculate ratios, not just counts
    - Use SUM() for age group columns
    - Join tables when comparing enrollments vs updates

    Example good query for "worst districts in Maharashtra":
    SELECT 
        e.district,
        SUM(e.age_0_5 + e.age_5_17 + e.age_18_greater) as enrollments,
        SUM(b.bio_age_5_17 + b.bio_age_17_) as bio_updates,
        ROUND(SUM(b.bio_age_5_17 + b.bio_age_17_)::numeric / 
            NULLIF(SUM(e.age_0_5 + e.age_5_17 + e.age_18_greater), 0), 2) as bio_ratio
    FROM enrollment e
    LEFT JOIN biometric_updates b ON e.state = b.state AND e.district = b.district
    WHERE e.state = 'Maharashtra'
    GROUP BY e.district
    ORDER BY bio_ratio DESC
    LIMIT 5;
    """
            )
            
            print("✓ LangChain SQL Agent initialized successfully")
            
        except Exception as e:
            print(f"✗ Failed to initialize LangChain Agent: {e}")
            raise e
    
    def query(self, user_question: str) -> dict:
        """
        Process natural language question and return results
        
        Args:
            user_question: User's question in natural language
            
        Returns:
            dict with 'answer' and 'sql' (if available)
        """
        try:
            # Invoke agent
            result = self.agent.invoke({"input": user_question})
            
            return {
                "success": True,
                "answer": result.get("output", "No answer generated"),
                "question": user_question
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "question": user_question
            }
    
    def get_schema_info(self):
        """Get database schema information"""
        try:
            return {
                "success": True,
                "tables": self.db.get_table_names(),
                "schema": self.db.get_table_info()
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Create agent instance
langchain_agent = LangChainAgent()