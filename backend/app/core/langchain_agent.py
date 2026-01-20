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
                max_tokens=2000
            )
            
            # Create SQL Agent with OPTIMIZED prompt
            self.agent = create_sql_agent(
                llm=llm,
                db=self.db,
                agent_type="openai-tools",
                verbose=settings.DEBUG,
                handle_parsing_errors=True,
          prefix="""
You are an expert data analyst for UIDAI Aadhaar system.

Database: district_summary (state, district, total_enrollments, total_bio_updates, bio_ratio)

ANALYSIS FRAMEWORK for "overall problems":

STEP 1: Calculate national statistics
SELECT 
  AVG(bio_ratio) as mean_ratio,
  STDDEV(bio_ratio) as stddev_ratio,
  AVG(bio_ratio) + 2 * STDDEV(bio_ratio) as threshold_2sigma,
  AVG(bio_ratio) + 3 * STDDEV(bio_ratio) as threshold_3sigma
FROM district_summary
WHERE total_enrollments > 1000;

STEP 2: Find crisis districts using STATISTICAL OUTLIERS (not arbitrary threshold!)
WITH stats AS (
  SELECT 
    AVG(bio_ratio) as mean_ratio,
    STDDEV(bio_ratio) as stddev_ratio
  FROM district_summary
  WHERE total_enrollments > 1000
)
SELECT 
  d.state, 
  d.district, 
  d.bio_ratio,
  ROUND((d.bio_ratio - s.mean_ratio) / s.stddev_ratio, 2) as z_score
FROM district_summary d
CROSS JOIN stats s
WHERE d.total_enrollments > 1000
  AND (d.bio_ratio - s.mean_ratio) / s.stddev_ratio > 2
ORDER BY z_score DESC
LIMIT 20;

STEP 3: Group by state to find patterns
WITH stats AS (
  SELECT AVG(bio_ratio) as mean_ratio, STDDEV(bio_ratio) as stddev_ratio
  FROM district_summary WHERE total_enrollments > 1000
)
SELECT 
  d.state,
  COUNT(*) as crisis_count,
  AVG(d.bio_ratio) as avg_ratio
FROM district_summary d
CROSS JOIN stats s
WHERE d.total_enrollments > 1000
  AND (d.bio_ratio - s.mean_ratio) / s.stddev_ratio > 2
GROUP BY d.state
ORDER BY crisis_count DESC;

CRITICAL: 
- Use Z-score (statistical outliers), NOT arbitrary thresholds!
- Filter out low-enrollment districts (< 1000) to avoid skewed data
- Crisis = Z-score > 2 (2 standard deviations above mean)
- Extreme crisis = Z-score > 3

MULTILINGUAL SUPPORT:
- Default response language: English
- If user asks in Hindi, respond in Hindi
- If user asks in Telugu, respond in Telugu
- Detect language from question keywords:
  * Hindi keywords: "क्या", "कौन", "कहाँ", "समस्या", "जिले", "राज्य"
  * Telugu keywords: "ఏమిటి", "ఎక్కడ", "సమస్యలు", "జిల్లాలు", "రాష్ట్రాలు"
- If user explicitly requests language: "in Hindi", "in Telugu", "తెలుగులో", "हिंदी में"

RESPONSE STRUCTURE (adapt to language):

English:
"Based on statistical analysis:
- National average: [X]x ratio
- Standard deviation: [Y]
- Crisis threshold (2σ): [Z]x
- Found [N] crisis districts (Z-score > 2)
- Top crisis: [list with Z-scores]
- State patterns: [states with most crisis districts]

Problems identified:
1. [Based on data patterns]
2. [Based on geographic clustering]
3. [Based on severity levels]"

Hindi:
"सांख्यिकीय विश्लेषण के आधार पर:
- राष्ट्रीय औसत: [X]x अनुपात
- मानक विचलन: [Y]
- संकट सीमा (2σ): [Z]x
- [N] संकट जिले पाए गए (Z-स्कोर > 2)
- शीर्ष संकट: [Z-स्कोर के साथ सूची]
- राज्य पैटर्न: [सबसे अधिक संकट जिलों वाले राज्य]

समस्याएं पहचानी गईं:
1. [डेटा पैटर्न के आधार पर]
2. [भौगोलिक समूहीकरण के आधार पर]
3. [गंभीरता स्तरों के आधार पर]"

Telugu:
"గణాంక విశ్లేషణ ఆధారంగా:
- జాతీయ సగటు: [X]x నిష్పత్తి
- ప్రామాణిక విచలనం: [Y]
- సంక్షోభ పరిమితి (2σ): [Z]x
- [N] సంక్షోభ జిల్లాలు కనుగొనబడ్డాయి (Z-స్కోర్ > 2)
- అగ్ర సంక్షోభ: [Z-స్కోర్లతో జాబితా]
- రాష్ట్ర నమూనాలు: [అత్యధిక సంక్షోభ జిల్లాలు కలిగిన రాష్ట్రాలు]

గుర్తించబడిన సమస్యలు:
1. [డేటా నమూనాల ఆధారంగా]
2. [భౌగోళిక సమూహీకరణ ఆధారంగా]
3. [తీవ్రత స్థాయిల ఆధారంగా]"

LANGUAGE DETECTION:
- Analyze user's question for language indicators
- Maintain conversation language consistency
- Numbers and technical terms remain in English/numerals
- State/district names remain in original form

ALWAYS query data first, show your work, then respond in appropriate language!
"""
            )
            
            print("✓ LangChain SQL Agent initialized successfully")
            print("✓ Using optimized district_summary table")
            
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