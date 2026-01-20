# UIDAI AI Analytics Platform

> An AI-powered monitoring and analysis system for India's Aadhaar authentication infrastructure
---

## The Problem

India's Aadhaar system processes millions of biometric authentication attempts daily. But something was wrong.

In some districts, citizens were forced to update their biometric data **60+ times** while others needed just one update. Rural farmers traveled 50km repeatedly, losing wages and dignity with each failed attempt.

**We analyzed 4.9 million transaction records to find out why.**

---

## What We Built

An intelligent platform that:

- **Monitors** real-time authentication performance across 985 districts
- **Identifies** crisis zones using statistical analysis (Z-score detection)
- **Explains** patterns through natural language AI chat
- **Visualizes** geographic and demographic trends
- **Supports** multilingual queries (English, Hindi, Telugu)

---

## Key Findings

**30 crisis districts identified** where citizens face 3-5x more authentication failures than the national average.

**Three major issues uncovered:**

1. **Rural-Urban Infrastructure Gap** - Rural districts perform 5-7x worse than urban centers
2. **Manual Labor Fingerprint Degradation** - 56% of updates come from working-age adults in agricultural regions
3. **Migration-Driven Update Burden** - 49M demographic updates (9x enrollment ratio) concentrated in urban hubs

**Impact:** 10-15 million citizens affected in identified crisis districts.

---

## Tech Stack

**Frontend:**
- HTML, TailwindCSS, Vanilla JavaScript
- Chart.js for interactive visualizations
- Responsive dashboard design

**Backend:**
- Python FastAPI
- LangChain for AI agent workflows
- Groq API (Llama 4 Maverick 17B 128E Instruct) for natural language processing

**Database:**
- PostgreSQL with optimized indexes
- Pre-aggregated summary tables for 10x performance

**Analytics:**
- Statistical outlier detection (Z-scores)
- Geographic pattern analysis
- Demographic segmentation

---

## Features

### 1. Real-Time Dashboard
- Live metrics: enrollments, biometric updates, crisis districts
- State performance rankings
- Crisis district identification
- Interactive filtering

### 2. AI Chat Assistant
- Natural language queries: *"Which districts need urgent attention?"*
- Multilingual support (English/Hindi/Telugu)
- Dynamic chart generation based on questions
- Statistical analysis on-demand

### 3. Smart Analytics
- Z-score based outlier detection
- Geographic clustering analysis
- Demographic pattern recognition
- Temporal trend analysis

---



## Project Structure
```
uidai-ai-platform/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # API endpoints
│   │   ├── core/            # LangChain agent, database
│   │   └── models/          # Data models
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── index.html
│   ├── assets/
│       ├── css/            # Styling
│       └── js/             # Dashboard logic

├── analysis.ipynb      # Jupyter notebook
├── UIDAI_Analysis_Report.pdf
└── README.md
```



---

## Demo Video

[Watch 1.5-minute demo](https://drive.google.com/file/d/1fGPYIkIkBYlPLU1zM9mKbufoo5pGmy8K/view?usp=sharing)

---

## Data Analysis

Full analysis available in Jupyter notebook: `analysis/analysis.ipynb`

**Methodology:**
- Statistical outlier detection using Z-scores
- Geographic clustering analysis
- Demographic segmentation
- Temporal pattern recognition

**Report:** See `docs/UIDAI_Analysis_Report.pdf` for complete findings

---

## Performance Optimizations

- **Database indexes** on state/district columns
- **Pre-aggregated summary tables** (district_summary, state_summary)
- **10x query speedup** - from 25-30s to 2-5s per query
- **Efficient chart rendering** with dynamic data fetching

---

## Contributing

This was built for UIDAI Data Hackathon 2026. 

**Built by:**
- Gandham Mani Saketh
- Abdul Faheem

---

## Acknowledgments

- **Data Source:** UIDAI Aadhaar transaction records (March-December 2025)
- **AI Model:** Groq API (Llama 4 Maverick 17B 128E Instruct)
- **Visualization:** Chart.js, Plotly.js
- **Framework:** FastAPI, LangChain
- **Database:** PostgreSQL


---

**Built with 💡 for data-driven governance**
