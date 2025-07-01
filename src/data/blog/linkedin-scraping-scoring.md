---
author: Pranshu Raj
pubDatetime: 2025-06-30T22:20:00.866Z
modDatetime: 2025-07-01T07:22:48.375Z
title: Building an AI LinkedIn Sourcing Agent
slug: linkedin-scraping-scoring
featured: true
draft: false
tags:
  - Scraping
  - FastAPI
  - Linkedin
description: How I built a complete recruiting pipeline that finds candidates, scores them intelligently, and generates personalized outreach
---


## The Challenge

Recruiting is broken. Finding the right candidates is like searching for needles in a haystack, and when you do find them, your generic LinkedIn message gets lost in their inbox with 50 others.

For Synapse's AI hackathon, the challenge was clear: **"Build a LinkedIn Sourcing Agent that finds profiles, scores candidates using AI, and generates personalized outreach messages."**


## What I Built

A complete LinkedIn sourcing pipeline with three core components:

1. **Smart Candidate Discovery** - Multi-source search using SerpAPI and Google
2. **Intelligent Scoring** - 6-factor algorithm that thinks like a senior recruiter  
3. **Personalized Outreach** - AI-generated messages using Llama via Groq

Instead of building another keyword matcher, I used LLMs to build something that understands candidate quality.

## The Technical Architecture

```
Job Description → Search Query generation → Search (SerpAPI) → Scrape Profile (RapidAPI) → Profile Data → Scoring → Outreach Message generation → Results
```
![data flow diagram](@/assets/images/data_flow.png)


![architecture](@/assets/images/architecture_lnkd_scraper.png)

### Key Components:
- **FastAPI backend** with async processing
- **Multi-source data collection** (LinkedIn via RapidAPI, GitHub via web scraping)
- **6-factor scoring algorithm** with confidence levels
- **Smart caching** to avoid re-fetching profiles (set for small scale, bloom filters for large scale)
- **Concurrency** using asyncio to execute multiple jobs quickly

## The Scoring Algorithm That Matters


| Factor | Weight | What It Measures |
|--------|--------|------------------|
| **Education** | 20% | Elite schools get higher scores |
| **Career Trajectory** | 20% | Clear progression vs. lateral moves |
| **Company Relevance** | 15% | FAANG/relevant industry experience |
| **Skill Match** | 25% | How well skills align with job requirements |
| **Location** | 10% | Geographic fit for the role |
| **Tenure** | 10% | Stability vs. job hopping patterns |

Since it's using LLMs, it doesn't check boxes - it understands context. A engineer who moved from startup → Google → senior role gets a higher trajectory score than someone who stayed at the same level for years.

## Smart Outreach Generation

Generic LinkedIn messages get ignored. My solution uses Llama (via Groq) to create personalized messages that:

- Reference specific experience and achievements
- Connect candidate background to job requirements  
- Feel personal, not templated
- Include clear next steps

**Example output:**
*"Hi Alex, I noticed your work at OpenAI on transformer architectures and your ICML 2023 paper on attention mechanisms. Your blend of research and production ML experience is exactly what Windsurf needs for their ML Research Engineer role..."*

## Key Technical Decisions

### Why These Choices Mattered:

**Llama via Groq instead of OpenAI**: Faster, cheaper, and surprisingly good at personalized messaging

**RapidAPI for LinkedIn data**: More reliable than web scraping, cleaner data extraction

**Async processing with FastAPI**: Can handle multiple jobs in parallel without blocking

**MongoDB for storage**: Perfect for flexible candidate profiles and easy scaling

**Smart caching**: Avoids re-fetching the same profiles, reduces overhead, cost

## Sample Results

Testing with the Windsurf ML Research Engineer role:

```json
{
  "name": "John Doe",
  "fit_score": 8.7,
  "confidence": 0.91,
  "score_breakdown": {
    "education": 9.2,    // Stanford PhD in ML
    "trajectory": 8.5,   // Research → Engineering → Lead
    "company": 9.0,      // Google, OpenAI experience
    "skills": 9.1,       // Perfect LLM/transformer match
    "location": 10.0,    // Mountain View based
    "tenure": 7.8        // Healthy 2-3 year progression
  },
  "outreach_message": "Hi John, I came across your transformer optimization work at Google Research, particularly your ICML paper on efficient attention mechanisms. Your move from research to production ML at OpenAI shows the exact blend we need at Windsurf..."
}
```

**Why this works for this JD:**
- Specific achievements (ICML paper)
- Career progression understanding
- Clear connection to role requirements

---

## What I Learned

### 1. Focus on the Algorithm, Not the Data Collection
Anyone can scrape LinkedIn*. The value is in smart scoring that understands candidate quality beyond keywords.

> Scraping Linkedin is a really difficult thing to do in practice, so everyone uses APIs provided by services like RapidAPI, BrightData. I know this because I tried to scrape it a lot a year ago.

### 2. Personalization Actually Works  
Generic outreach gets low response rates. AI-generated personalized messages referencing specific achievements can convert a lot of leads.

As a fallback, we always have template messages.

### 3. Production Thinking From Day 1
Built with FastAPI, async processing, proper error handling, and caching. This is designed to scale easily.

### 4. Multi-Source Data is Key
Combining LinkedIn + GitHub profiles gives much richer candidate insights than either alone.

## Scaling Strategy

For production use (100s of jobs daily):

1. **Async Processing**: Already built with asyncio for parallel job handling. Can explore multiprocessing as well
2. **Queue System**: Redis/Celery integration template implemented, integration remains 
3. **Database**: MongoDB for caching profiles and storing results
4. **Rate Limiting**: Smart backoff with API key rotation
5. **Observability**: Comprehensive logging for performance tracking (add complex later)
6. **Comprehensive Testing**: Including load testing, e2e and more

## Challenges faced

1. Managing multiple models to build the repo backfired: Claude gave structured code which did not work, I used Gemini and OpenAI models to fix it, which took a lot of time.
2. Data validation issues: Took a lot of time and trials to debug and fix.
3. Groq LLama variance: Did not generate JSON a lot of times - derailed the whole downstream logic.
4. Github profile scraping: Got false positives of organizations (huggingface). Did not integrate into final for this reason.


## Future Roadmap

### Short Term (1-2 months)
- [ ] Complete MongoDB async integration with Motor
- [ ] Docker containerization for deployment
- [ ] Enhanced deduplication using bloom filters
- [ ] A/B testing framework for prompt optimization

### Medium Term (3-6 months)
- [ ] Multi-platform integration (Twitter, personal websites)
- [ ] Advanced ML models for candidate scoring
- [ ] Real-time job market insights
- [ ] Integration with ATS systems

### Long Term (6+ months)
- [ ] Predictive analytics for hiring success
- [ ] Automated interview scheduling
- [ ] Bias detection and mitigation
- [ ] Custom model training for specific companies

## Try It Yourself

**GitHub Repository**: [score_profiles](https://github.com/pranshu-raj-211/score_profiles)  
**API Documentation**: Available at `/docs` when running locally

> I tried using uv, but there were some issues on my laptop recently - so I switched to pip

```bash
# Quick start
git clone https://github.com/pranshu-raj-211/score_profiles.git
cd score_profiles
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
python app/main.py
```

**API Usage:**
```bash
curl -X POST "http://localhost:8000/jobs" \
  -H "Content-Type: application/json" \
  -d '{"search_query": "ML Engineer at AI startup", "max_candidates": 10}'
```

## Why This Solution Stands Out

1. **High Concurrency** - Built with FastAPI, async processing, proper error handling, tests
2. **Intelligent scoring algorithm** - Goes beyond keyword matching to understand candidate quality
3. **Personalized outreach** - AI-generated messages that reference specific achievements  
4. **Multi-source data** - Combines LinkedIn and GitHub for richer profiles
5. **Scalable design** - Can handle multiple jobs in parallel with smart caching (async task queue with Redis + Celery template ready)

## The Real Impact

This isn't just a hackathon project. It's a solution that could:
- Save recruiters hours of manual searching and screening
- Increase response rates through personalized outreach
- Reduce hiring bias through consistent, data-driven scoring
- Find qualified candidates that keyword searches miss

**The future of recruiting is AI-powered, and it's already here.**

---

*Built for the Synapse AI Challenge.*

**[Demo Video]()** | **[GitHub Repository](https://github.com/pranshu-raj-211/score_profiles)** | **[API Documentation]**