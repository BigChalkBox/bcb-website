# BigChalkBox: Intelligent Question Paper (QP) Moderation Module
*Marketing & Feature Overview*

**BigChalkBox** is a cutting-edge, AI-powered academic platform designed to streamline and elevate the examination moderation process. Built with modern web technologies (Next.js, Prisma) and driven by Google's Gemini generative AI, the platform automates the tedious, error-prone tasks of curriculum mapping, question extraction, and quality assurance. 

By running deep cognitive and structural analyses on exam papers against syllabus requirements, BigChalkBox ensures every assessment is fair, balanced, and perfectly aligned with course outcomes.

---

## 🚀 Core Value Proposition
For universities and academic institutions, manual question paper moderation is slow, subjective, and prone to oversight. BigChalkBox acts as a **tireless, objective AI auditor** that reads question papers and syllabi natively, flagging typos, ambiguities, difficulty imbalances, and out-of-syllabus questions before the exam ever reaches a student.

---

## 🌟 Key Features & Capabilities

### 1. Role-Based Workflow & Secure Authentication
BigChalkBox provides distinct, secure portals tailored to specific academic roles, ensuring proper governance and data privacy.
* **Super Admin**: Full oversight over users and institutional settings.
* **Course Coordinator (CC)**: Creates courses, assigns faculty, and manages the master syllabus for each course.
* **Teacher/Faculty**: Uploads draft question papers and links them to the assigned syllabi for moderation.

### 2. Intelligent Syllabus Management
Managing course structures is no longer a manual data-entry chore. 
* **AI Syllabus Parsing**: Upload a syllabus document (PDF, Image, or Text) and the AI engine automatically parses it into a structured JSON format.
* **Granular Extraction**: Accurately extracts **Course Outcomes (COs)**, **Units**, and detailed **Topics / Sub-topics**.
* **Review & Publish**: Coordinators can review the AI-extracted structure, make manual edits, save as drafts, and publish the official version for teachers to use.

### 3. AI-Powered Question Paper Extraction
BigChalkBox reads raw exam papers exactly like a human would, but faster.
* **Multi-Format Support**: Upload question papers directly as PDFs or images. The backend intelligently upscales the resolution for perfect Optical Character Recognition (OCR).
* **Smart Parsing Rules**: The AI identifies sections (e.g., "Section A"), instructions, and individual questions.
* **Flawless 'OR' Handling**: Distinctively recognizes internal choices (OR questions) without messing up the numbering sequence, extracting them as linked alternatives.
* **LaTeX / Math Preservation**: Retains the semantic meaning of complex equations and mathematical notations.

### 4. Deep Moderation Analysis (10-Point AI Audit)
Once a paper is uploaded, the AI runs a rigorous, multi-pass analysis evaluating the paper on 10 critical academic parameters.
* **Typo & Grammar Check**: Catches spelling and grammatical errors that could confuse students.
* **Readability Evaluation**: Ensures the language is accessible and appropriate for the intended academic level.
* **Ambiguity Detection (Two-Pass System)**: Flags vague phrasing. *Smart Filter:* It cross-references suspected ambiguities against the actual syllabus to prevent false alarms, ensuring only genuine confusing questions are flagged.
* **Marks-vs-Effort & Time Feasibility**: Evaluates if the marks allocated to a question align with the effort required to solve it, and tags each question with an estimated completion time to prevent excessively lengthy exams.
* **Grading Ease**: Assesses whether the question is framed in a way that allows for objective, straightforward grading by evaluators.
* **Duplicate Detection**: Scans the paper to ensure no concepts or questions are inadvertently repeated.
* **OR-Choice Balance**: Ensures that students picking alternative 'OR' questions face the exact same level of difficulty and conceptual weight.
* **Bloom’s Taxonomy Mapping**: Automatically categorizes every question into cognitive levels (*Remember, Understand, Apply, Analyze, Evaluate, Create*). Alerts the creator if the paper relies too heavily on rote memorization (e.g., >50% lower-order skills) or lacks higher-order thinking challenges.
* **Difficulty Mix Calculation**: Classifies questions as *Easy, Medium,* or *Hard*, warning if a paper is too easy (risking a ceiling effect) or overly difficult.
* **AI Revisions**: Doesn't just point out flaws—it actively suggests revised text to instantly fix clarity, typos, and grading issues.

### 5. Pinpoint Coverage Analysis
BigChalkBox proves whether an exam is truly comprehensive.
* **Automated Syllabus Mapping**: The AI cross-references every single extracted question against the mapped syllabus to find exactly which Unit and Topic it tests.
* **Out-of-Syllabus Detection**: Instantly flags any question that tests concepts not found in the official curriculum.
* **Course Outcome (CO) Validation**: Checks if the CO printed on the question paper actually matches the syllabus topic being tested.
* **Visual Coverage Breakdown**: Generates a clear report showing exactly which topics were heavily tested, and more importantly, lists the topics that were completely ignored.

### 6. Automated Reporting & Export
BigChalkBox turns complex AI metadata into actionable, boardroom-ready reports.
* **Comprehensive Moderation Verdict**: Aggregates all warnings, coverage scores, and taxonomy balances into a single dashboard.
* **One-Click Exports**: Download the full, styled moderation report as a PDF, Microsoft Word document, or an interactive PowerPoint presentation ready to be shared with academic committees.

---

## 🛠️ Technical Edge (The "No-Bluff" Reality)
* **Parallel Processing Engine**: Runs intensive AI checks concurrently (batching per-question checks) to deliver full paper moderation in seconds.
* **Resilient LLM Integration**: Built on Google's Gemini-Flash models with a robust fallback mechanism that retries operations across different model versions if safety filters or parsing errors occur.
* **Clean Data Extraction**: Overcomes the classic limitation of LLMs hallucinating numbering by strictly enforcing continuous integer indexing and JSON-only outputs, ensuring database integrity.
* **Beautiful, "Editorial" UI**: Designed using Anthropic's "Claude-design-analysis" guidelines. It replaces the typical sterile SaaS look with a warm cream canvas (`#FCFCF7`), deep navy product surfaces, and elegant slab-serif typography ("Copernicus" / "Tiempos"), providing an incredibly premium, academic feel.
