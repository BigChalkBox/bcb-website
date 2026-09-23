import json
import re

with open('/Users/konalsmac/Downloads/how_to_build_better_test_papers_for_fair_student_assessment.html', 'r') as f:
    html = f.read()

# Extract H1 for title
title_match = re.search(r'<h1>(.*?)</h1>', html)
title = title_match.group(1) if title_match else "How to Build Better Test Papers for Fair Student Assessment"

slug = "how-to-build-better-test-papers-for-fair-student-assessment"

# Split by H2
parts = re.split(r'<h2>(.*?)</h2>', html)

# The first part is before the first H2. It contains the image and intro (heroAnswer)
intro_html = parts[0]
intro_html = re.sub(r'<h1>.*?</h1>', '', intro_html, flags=re.IGNORECASE).strip()
hero_answer = intro_html

sections = []
faqItems = []

# parse sections
for i in range(1, len(parts), 2):
    heading = parts[i]
    content = parts[i+1].strip()
    
    if heading.lower() == "frequently asked questions":
        # parse faqs
        faq_parts = re.findall(r'<p><strong>(.*?)</strong>(.*?)</p>', content)
        for q, a in faq_parts:
            faqItems.append({
                "question": q.strip(' ?') + '?',
                "answer": a.strip()
            })
    else:
        sections.append({
            "heading": heading,
            "content": content
        })

article = {
    "slug": slug,
    "isHtml": True,
    "title": title,
    "description": "Better test papers measure the right learning outcomes and make grading more consistent across evaluators.",
    "category": "Guide",
    "tags": [
        "test papers",
        "student assessment",
        "university exams",
        "NAAC",
        "IQAC",
        "education assessment software",
        "university assessment platform"
    ],
    "publishedAt": "2026-08-04",
    "updatedAt": "2026-08-04",
    "readTime": "8 min read",
    "author": {
        "name": "Dr. Priya Venkataraman",
        "credentials": "Head of Academic Partnerships, BCBX Innovations Private Limited."
    },
    "heroAnswer": hero_answer,
    "sections": sections,
    "faqItems": faqItems
}

# Now inject into src/app/blog/articles.js
with open('src/app/blog/articles.js', 'r') as f:
    js_content = f.read()

# Find the end of the articles array
# It ends with } \n ];
end_idx = js_content.rfind('];')

if end_idx != -1:
    article_json = json.dumps(article, indent=4)
    # Add a comma and the new article
    new_js = js_content[:end_idx].rstrip()
    if new_js.endswith('}'):
        new_js += ",\n"
    new_js += article_json + "\n" + js_content[end_idx:]
    
    with open('src/app/blog/articles.js', 'w') as f:
        f.write(new_js)
    print("Successfully injected article.")
else:
    print("Could not find the end of the articles array.")

