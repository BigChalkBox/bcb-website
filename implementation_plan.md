# Applying the `blogs-writing` Skill to All Articles

The goal is to apply the `blogs-writing` skill to all 21 blog articles in `articles.js`. Since the skill requires a very specific, in-depth B2B/EdTech explainer format (including 4-8 sections, heavy table usage, common mistakes, checklists, and 4-6 FAQs), this means **significantly rewriting and expanding** each article from its current short format.

## User Review Required

Because rewriting 21 articles to this level of depth is a massive task that will exceed output limits if done all at once, I will follow your instruction to do them **ONE BY ONE**. 

For each article, I will:
1. Rewrite the content entirely to match the 14-step checklist in the `blogs-writing` skill.
2. Convert it into the new HTML-based structure we set up (using `isHtml: true` and parsing markdown into the JSON object).
3. Inject the updated article back into `articles.js`.
4. Stop and ask you to review the result before moving to the next article.

> [!IMPORTANT]
> Since this is a very long process, please approve this plan so we can start with Article #1: **"How to Grade Handwritten Exams Faster (AI Benchmark)"**.

## Proposed Changes

### 1. Article-by-Article Rewrite Workflow
For each article, I will write a custom script to inject the newly rewritten content into `articles.js`. The rewritten content will follow the required skeleton:
- **Reframe + stakes** (intro)
- **Early table preview**
- **4–8 process/step sections**
- **"Use AI carefully" section**
- **Common mistakes to avoid**
- **Final checklist table**
- **FAQ** (4-6 pairs)
- **Closing CTA section**

### 2. Execution of Article 1
Once you approve this plan, I will immediately execute the rewrite for the first article: `ai-grading-handwritten-exams`.

## Verification Plan

### Automated Tests
- `node -c src/app/blog/articles.js` to ensure the JSON remains valid after every single injection.
- `npm run build` periodically to ensure static pages compile correctly.

### Manual Verification
- You will need to check the live local server for each blog post as I complete them to ensure the formatting and tone match the house style.
