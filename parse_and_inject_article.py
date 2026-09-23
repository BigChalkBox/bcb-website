import json
import re
import subprocess
import sys

# Ensure markdown is installed
try:
    import markdown
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "markdown"])
    import markdown

file_path = '/Users/konalsmac/Downloads/how_to_create_an_accurate_answer_key_for_university_exams.md'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Custom parser for our structure
# Title is known: "How to Create an Accurate Answer Key for University Exams"
# The first few paragraphs before the first ## will be the description and heroAnswer.
parts = text.split('##')

intro_text = parts[0].strip()
intro_html = markdown.markdown(intro_text)

# We can use the first sentence as description, and the rest as heroAnswer
description = "An accurate answer key is not just a list of correct answers. For a university exam, it is the document that turns a question paper into a fair, consistent, auditable evaluation process."
heroAnswer = "When the key is vague, faculty members interpret answers differently, students raise more revaluation requests, and examination teams spend weeks resolving disputes. When it is precise, every evaluator understands what to award, what to reject, and how to handle partially correct responses. For Indian universities managing large cohorts, multiple evaluators, descriptive answers, practical components, and NAAC or IQAC documentation, answer key accuracy should be treated as an assessment quality control process, not a last-minute clerical task."

sections = []
faq_items = []

for part in parts[1:]:
    lines = part.strip().split('\n')
    heading = lines[0].strip()
    content_md = '\n'.join(lines[1:]).strip()
    
    if heading.lower() == 'frequently asked questions':
        # Parse FAQs
        faq_lines = content_md.split('\n\n')
        for line in faq_lines:
            if line.startswith('**'):
                # Extract question and answer
                q_match = re.match(r'\*\*(.*?)\*\*(.*)', line, re.DOTALL)
                if q_match:
                    faq_items.append({
                        "question": q_match.group(1).strip(),
                        "answer": q_match.group(2).strip()
                    })
    else:
        content_html = markdown.markdown(content_md, extensions=['tables'])
        sections.append({
            "heading": heading,
            "content": content_html
        })

new_article = {
    "slug": "how-to-create-accurate-answer-key-university-exams",
    "title": "How to Create an Accurate Answer Key for University Exams",
    "description": description,
    "category": "Tutorial",
    "tags": ["answer key", "university exams", "evaluation", "NAAC", "IQAC"],
    "publishedAt": "2026-08-03",
    "updatedAt": "2026-08-03",
    "readTime": "8 min read",
    "author": {
        "name": "Dr. Priya Venkataraman",
        "credentials": "Head of Academic Partnerships, BCBX Innovations Private Limited. Ph.D. Educational Technology (Delhi University). 12 years in Indian higher education administration."
    },
    "heroAnswer": heroAnswer,
    "sections": sections,
    "faqItems": faq_items,
    "isHtml": True
}

articles_path = '/Users/konalsmac/Local-Desktop/PRODUCTION-LEVEL-DASES/src/app/blog/articles.js'
with open(articles_path, 'r', encoding='utf-8') as f:
    articles_content = f.read()

match = re.search(r'(\s+)\}\n\];', articles_content)
if match:
    insert_pos = match.end(1) + 1 # right after the `}`
    
    new_articles_json = json.dumps([new_article], indent=4)
    # Strip the leading `[\n` and trailing `\n]`
    new_articles_json = new_articles_json[2:-2]
    
    new_content = articles_content[:insert_pos] + ",\n" + new_articles_json + "\n" + articles_content[insert_pos:]
    
    with open(articles_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully appended article to articles.js")
else:
    print("Failed to find insertion point.")
