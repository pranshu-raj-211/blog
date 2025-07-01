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
## The Challenge: Round Two with LinkedIn

> Read the full version at [https://blog.pranshu-raj.me/posts/linkedin-scraping-full](https://blog.pranshu-raj.me/posts/linkedin-scraping-full).

Recruiting is broken. Finding the right candidates is like searching for needles in a haystack, and when you do find them, your generic LinkedIn message gets lost with 50 others.

Two years ago, I tried building a LinkedIn scraper. LinkedIn's anti-scraping measures crushed that dream within days. This hackathon was my chance for round two.

## What I Built

Instead of another keyword-matching tool, I built something that thinks like a recruiter:

**Job Description → Smart Search → Profile Scraping → AI Scoring → Personalized Messages**

Core components:

- Multi-source discovery: LinkedIn + GitHub profiles
- 6-factor scoring algorithm that goes beyond keywords
- AI-powered outreach via Llama/Groq
- Async processing for multiple jobs

## The Technical Stack

FastAPI backend with async processing throughout. Used RapidAPI for LinkedIn data (because scraping LinkedIn directly is still a nightmare), SerpAPI for search, and Groq for AI messaging.

![data flow diagram](@/assets/images/data_flow.png)
*Data flow diagram*

![architecture](@/assets/images/architecture_lnkd_scraper.png)
*App architecture*

## Smart Scoring Algorithm

| Factor | Weight | What It Measures |
|--------|---------|------------------|
| Education | 20% | Elite schools get higher scores |
| Career Trajectory | 20% | Clear progression vs. lateral moves |
| Company Relevance | 15% | Relevant industry experience |
| Skill Match | 25% | How well skills align with requirements |
| Location | 10% | Geographic fit |
| Tenure | 10% | Stability vs. job hopping |

The LLM understands context - an engineer who went startup → Google → senior role gets higher trajectory scores than someone stuck at the same level.

## Personalized Outreach

Generic LinkedIn messages get ignored. My solution creates messages that reference specific achievements and feel personal, not templated.

Example: *"Hi John, I noticed your transformer optimization work at Google Research, particularly your ICML paper on efficient attention mechanisms..."*

## What Actually Worked

**Smart Caching**: Saves API costs by checking if we've seen profiles before
**Async Processing**: Process 10 profiles in 5-6 seconds instead of 30 seconds sequentially  
**The Scoring Algorithm**: LLMs recognize career patterns that regex never could

## The Real Challenges

**LinkedIn's Anti-Scraping**: Learned my lesson from 2022. Went straight to paid APIs instead of fighting their defenses.

**LLM Consistency**: Groq returned proper JSON maybe 70% of the time. Had to build fallback parsing with regex.

**Data Validation**: Biggest time sink. Started doing TDD-style development midway through.

## Why This Matters

This isn't just a hackathon project. It could save recruiters hours of manual work, increase response rates through personalization, and find qualified candidates that keyword searches miss.

The expensive API solution turned out cheaper when you factor in development time. Sometimes paying for reliability beats fighting the system.

**Try it yourself**: [GitHub Repository](https://github.com/pranshu-raj-211/score_profiles)
