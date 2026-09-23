const fs = require('fs');
const { marked } = require('marked');

const mdPath = 'scratch_article_1.md';
const text = fs.readFileSync(mdPath, 'utf-8');

const parts = text.split('## ');

const introText = parts[0].trim();
const introHtml = marked.parse(introText);

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

const articlesPath = '/Users/konalsmac/Local-Desktop/PRODUCTION-LEVEL-DASES/src/app/blog/articles.js';
let articlesContent = fs.readFileSync(articlesPath, 'utf-8');

// We need to parse the articles.js file, find the article, update it, and write it back.
// Since articles.js exports a JS array, we can't easily parse it with JSON.parse.
// However, since it is cleanly formatted, we can require it (it's JS) to get the object, 
// update the object, and then re-generate the file. But wait, it's ES module (export const articles = ...).
// Let's just do string replacement or write a dynamic loader.

// Best way: strip the "export const articles = " and the functions at the end, parse as JSON, modify, and rewrite.

const matchStart = articlesContent.indexOf('[');
const matchEnd = articlesContent.indexOf('];\n\nexport function');
if (matchStart !== -1 && matchEnd !== -1) {
    const jsonStr = articlesContent.substring(matchStart, matchEnd + 1);
    let articles = JSON.parse(jsonStr);
    
    // Find article 1
    const idx = articles.findIndex(a => a.slug === 'ai-grading-handwritten-exams');
    if (idx !== -1) {
        articles[idx].isHtml = true;
        // Keep description and heroAnswer as they were, they are fine, but wait, the introText is our new heroAnswer.
        // The SKILL says no header for intro. Let's make heroAnswer = introText.
        articles[idx].heroAnswer = introText;
        articles[idx].sections = sections;
        articles[idx].faqItems = faqItems;
        
        const newJsonStr = JSON.stringify(articles, null, 4);
        
        const newContent = articlesContent.substring(0, matchStart) + newJsonStr + articlesContent.substring(matchEnd + 1);
        fs.writeFileSync(articlesPath, newContent, 'utf-8');
        console.log("Successfully updated article 1 in articles.js");
    } else {
        console.log("Article not found.");
    }
} else {
    console.log("Failed to parse articles.js structure.");
}
