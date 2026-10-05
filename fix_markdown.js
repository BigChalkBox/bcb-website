import fs from 'fs';

function fixFile(filename) {
    let md = fs.readFileSync(filename, 'utf8');
    
    // Replace untagged code blocks intelligently
    md = md.replace(/^```[ \t]*\n([\s\S]*?)\n```[ \t]*$/gm, (match, content) => {
        const trimmed = content.trim();
        let lang = '';
        if (trimmed.startsWith('curl') || trimmed.startsWith('export ') || trimmed.startsWith('#!/bin/bash')) {
            lang = 'bash';
        } else if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            lang = 'json';
        } else if (trimmed.includes('HMAC-SHA256(') || trimmed.startsWith('0. create the test')) {
            lang = 'prose';
        } else {
            lang = 'text';
        }
        return `\`\`\`${lang}\n${content}\n\`\`\``;
    });

    fs.writeFileSync(filename, md);
    console.log(`Fixed ${filename}`);
}

fixFile('docs/partner-api-reference.md');
fixFile('docs/partner-api-integration-guide.md');
