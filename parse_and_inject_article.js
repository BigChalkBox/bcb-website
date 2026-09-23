const fs = require('fs');
const { marked } = require('marked');

const filePath = '/Users/konalsmac/Downloads/how_to_create_an_accurate_answer_key_for_university_exams.md';
const text = fs.readFileSync(filePath, 'utf-8');

const parts = text.split('## ');

const introText = parts[0].trim();
const introHtml = marked.parse(introText);

const description = "An accurate answer key is not just a list of correct answers. For a university exam, it is the document that turns a question paper into a fair, consistent, auditable evaluation process.";
const heroAnswer = "When the key is vague, faculty members interpret answers differently, students raise more revaluation requests, and examination teams spend weeks resolving disputes. When it is precise, every evaluator understands what to award, what to reject, and how to handle partially correct responses. For Indian universities managing large cohorts, multiple evaluators, descriptive answers, practical components, and NAAC or IQAC documentation, answer key accuracy should be treated as an assessment quality control process, not a last-minute clerical task.";

const sections = [];
const faqItems = [];

for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim();
    const lines = part.split('\n');
    const heading = lines[0].trim();
    const contentMd = lines.slice(1).join('\n').trim();
    
    if (heading.toLowerCase() === 'frequently asked questions') {
        const faqLines = contentMd.split('\n\n');
        for (const line of faqLines) {
            if (line.startsWith('**')) {
                const match = line.match(/\*\*(.*?)\*\*\s*(.*)/s);
                if (match) {
                    faqItems.push({
                        question: match[1].trim(),
                        answer: match[2].trim()
                    });
                }
            }
        }
    } else {
        const contentHtml = marked.parse(contentMd);
        sections.push({
            heading: heading,
            content: contentHtml
        });
    }
}

const newArticle = {
    slug: "how-to-create-accurate-answer-key-university-exams",
    title: "How to Create an Accurate Answer Key for University Exams",
    description: description,
    category: "Tutorial",
    tags: ["answer key", "university exams", "evaluation", "NAAC", "IQAC"],
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-03",
    readTime: "8 min read",
    author: {
        name: "Dr. Priya Venkataraman",
        credentials: "Head of Academic Partnerships, BCBX Innovations Private Limited. Ph.D. Educational Technology (Delhi University). 12 years in Indian higher education administration."
    },
    heroAnswer: heroAnswer,
    sections: sections,
    faqItems: faqItems,
    isHtml: true
};

const articlesPath = '/Users/konalsmac/Local-Desktop/PRODUCTION-LEVEL-DASES/src/app/blog/articles.js';
const articlesContent = fs.readFileSync(articlesPath, 'utf-8');

const match = articlesContent.match(/\}\s*\];/);
if (match) {
    const insertPos = match.index + 1; // right after the closing '}'
    
    let newArticlesJson = JSON.stringify([newArticle], null, 4);
    newArticlesJson = newArticlesJson.substring(2, newArticlesJson.length - 2);
    
    const newContent = articlesContent.substring(0, insertPos) + ",\n" + newArticlesJson + "\n];\n" + articlesContent.substring(match.index + match[0].length);
    
    fs.writeFileSync(articlesPath, newContent, 'utf-8');
    console.log("Successfully appended article to articles.js");
} else {
    console.log("Failed to find insertion point.");
}
