import fs from 'fs';
const guide = fs.readFileSync('docs/partner-api-integration-guide.md', 'utf8');
const ref = fs.readFileSync('docs/partner-api-reference.md', 'utf8');
const combined = guide + '\n\n---\n\n' + ref;
const re = /(`{3,4})(\w*)[ \t]*\n([\s\S]*?)\n\1[ \t]*(?=\n|$)/g;
let match;
while ((match = re.exec(combined)) !== null) {
  if (match[3].includes('GET /assignments/{id}/submissions')) {
    console.log("MATCH LANG:", match[2]);
    console.log("MATCH CONTENT:\n" + match[3].substring(0, 300));
  }
}
