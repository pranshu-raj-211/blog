---
author: Pranshu Raj
pubDatetime: 2025-07-01T3:50:00.866Z
modDatetime: 2025-07-01T03:51:27.097Z
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

Synapse asked us to build a real world app for their hackathon. The goal: **"Build a LinkedIn Sourcing Agent that finds profiles, scores candidates using a fit algorithm, and generates personalized outreach messages."**

This was about solving the core recruiting problem: finding the right people and reaching out effectively.

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
![data flow diagram](@assets/images/data_flow.png)


![architecture](@assets/images/architecture_lnkd_scraper.png)

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

**Why this works:**
- Specific achievements (ICML paper)
- Career progression understanding
- Clear connection to role requirements

## What I Learned

### 1. Focus on the Algorithm, Not the Data Collection
Anyone can scrape LinkedIn. The value is in smart scoring that understands candidate quality beyond keywords.

### 2. Personalization Actually Works  
Generic outreach gets 2-3% response rates. AI-generated personalized messages referencing specific achievements can hit 15%+.

### 3. Production Thinking From Day 1
Built with FastAPI, async processing, proper error handling, and caching. This isn't a demo - it's designed to scale.

### 4. Multi-Source Data is Key
Combining LinkedIn + GitHub profiles gives much richer candidate insights than either alone.

## Scaling Strategy

For production use (100s of jobs daily):

1. **Async Processing**: Already built with asyncio for parallel job handling
2. **Queue System**: Redis/Celery integration partially implemented  
3. **Database**: MongoDB for caching profiles and storing results
4. **Rate Limiting**: Smart backoff with API key rotation
5. **Monitoring**: Comprehensive logging for performance tracking

## Future Improvements

- **Docker deployment** for easy scaling
- **Advanced deduplication** using bloom filters
- **Custom ML models** for better skill matching  
- **A/B testing** for message effectiveness
- **Multi-platform integration** (Twitter, personal websites)

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