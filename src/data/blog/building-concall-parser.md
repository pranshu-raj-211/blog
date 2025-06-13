---
author: Pranshu Raj
pubDatetime: 2025-05-19T15:22:00.866Z
title: Building a Python Package to Turn Unstructured Data into Financial Insights
slug: building-concall-parser
featured: true
draft: false
tags:
  - Python
  - Finance
  - NLP
  - Data Engineering
description: How we built concall-parser to extract structured insights from messy earnings call transcripts, dealing with PDFs, text processing, and speaker identification challenges.
---

Earnings calls are packed with crucial information, but trying to extract it from their transcripts is often a painful manual process. These documents, usually PDFs, are a nightmare of inconsistent formatting. Every company seems to do things differently, layouts change without warning, and they're filled with noise and excessive text.

We ([Jay Shah](https://www.linkedin.com/in/jay-shah-4a4829209/) and I) needed a way to programmatically get structured data out of this mess – with the end goal of building a full pipeline that can deliver insights and reduce time spent to understand how a company is doing.

### The Problem: Unstructured PDFs Break Everything

The core challenge here is turning a visually-oriented PDF document into clean, logically structured text that code can understand. When you pull text out of these transcripts, you don't just get the content; you get artifacts that completely disrupt parsing:

- Headers and footers are stuck into the text stream.
- Words get broken up across lines or pages, or by random characters inserted during transcription (we actually saw `management` turn into `m\n anagement`).
- Spacing and paragraph breaks are inconsistent.

These aren't just minor annoyances; they break any simple pattern-matching logic you might use later. If your code expects a clean word or phrase, noisy text like `m anagement` will cause it to fail.

### The Pipeline

We designed `concall-parser` as a multi-step process to handle this progressively. Here's the basic flow:

![concall parser workflow](https://raw.githubusercontent.com/pranshu-raj-211/pranshu-raj-211.github.io/main/_posts/static/concall-parser-workflow.png)

1. **Load:** Get the PDF input.
2. **Extract Text:** Pull the raw text out page by page (used `pdfplumber` for this).
3. **Clean & Segment:** Process the raw text to fix errors, identify who's speaking, and break the text into individual speaker turns.
4. **Categorize:** Group the speaker turns into sections like Management's opening remarks and the Q&A.
5. **Output:** Provide the final structured data.

Steps 2 and 3 were where most of the technical headaches (and interesting solutions) lay.

### Tackling the Hard Parts

Building this meant confronting some specific problems head-on.

#### Problem 1: Getting Clean Text

The text coming straight out of the PDF is just not reliable. Besides headers/footers, those internal text errors like `m anagement` mean you can't trust the raw output for pattern matching.

- **Why regex breaks here?** Regex is too fragile for this kind of unpredictable noise. You can't write rules for every way text might be broken or have junk inserted.
- **Why not LLMs for cleaning?** For this specific task – fixing character-level or word-level errors – LLMs felt like overkill and came with risks. You don't want an AI "fixing" text in a way that changes a financial number or removes a critical piece of jargon. They're also non-deterministic and add latency.

Our solution here was to accept the raw text and then apply specific, deterministic heuristics _after_ extraction to fix the most common issues we saw. For instance, I built logic to detect and reassemble fragmented words based on common patterns. It's not perfect, but it cleans up enough of the noise to make downstream steps possible. We're also exploring trying other PDF-to-text libraries and using page cropping to get cleaner input from the start.

#### Problem 2: Figuring Out Who Spoke

Identifying speakers and segmenting the text by speaker is critical. The pattern is usually `<Name>:<Speech>`, but it's rarely that simple: names might be missing from introductions, the "Moderator" tag isn't always used, analysts don't appear in a speaker list, and colons appear _everywhere_ in financial text (ratios, bullet points, etc.). A simple regex looking for `.*:` after every line fails miserably.

We needed a more robust way to find speakers that wasn't fooled by stray colons or missing intros. The solution was to develop a heuristic: scan the text for structural cues that _typically_ indicate a speaker turn – think capitalized text at the start of a line, followed by punctuation. This gives a list of _potential_ speaker names.

Then, I apply my own validation logic to this list. This involves checking potential names against various criteria (like capitalization consistency, length, frequency patterns) to filter out false positives and build a reliable list of the actual speakers in the call. This approach is flexible enough to work even when the formatting isn't perfect. Once we have that list of validated speakers, segmenting the text becomes straightforward – split the text block every time I see a validated speaker name followed by a colon.

#### Problem 3: What Kind of Content is This?

Finally, we needed to differentiate between Management's prepared remarks and the Analyst Q&A.

If a Moderator is present (which is usually the case), this becomes a lot easier - moderators introduce people who are speaking, signal the start of analyst sessions and this can be used to separate the parts.

If there isn't a moderator, heuristics and llm logic need to be applied.

### The Output: Clean Data for Analysis

After all this processing, `concall-parser` gives you structured data: a list of identified management personnel, the text of management's comments, and the Q&A pairs.

This structured output is the whole point. It's clean, predictable, and ready for the next step. You can easily feed it into other scripts or libraries for NLP tasks like sentiment analysis, run simple code to pull out key numbers or metrics, or compare sections across different reports. We've managed to get the parser working reliably for a majority of companies in the Nifty 200 index, which shows the approach holds up against real-world variability.

### What's Next

This is still a work in progress. We're continuing to improve `concall-parser` by:

- Trying to get even cleaner text out of the PDF initially.
- Handling more of the edge case formats I still encounter.
- Thinking about building some modules on top of the parser for common tasks like automatically spotting metrics or basic sentiment.

Turning messy, unstructured documents into usable data is a challenging but rewarding problem to solve as an engineer.

We're actively developing concall-parser. Try it out and let us know your feedback!
