import fs from 'fs';
const file = '/Users/konalsmac/.gemini/antigravity-ide/brain/92e7beb3-e28e-4a8a-8818-f26116a68e25/walkthrough.md';
let content = fs.readFileSync(file, 'utf8');

content += `
## Step 7: Final Code Block Classification
To ensure the correct code blocks were extracted to the dark sandbox, a script was run to scan all markdown documentation files and intelligently tag every single untagged code block (\\\`\\\`\\\`).
- If a block contained \\\`curl\\\` commands, it was tagged as \\\`bash\\\` and pushed to the right sandbox.
- If it contained JSON responses, it was tagged as \\\`json\\\` and pushed to the sandbox.
- If it contained inline formulas or step-by-step descriptions, it was tagged as \\\`prose\\\` and kept inline.

This resolves the issue where code examples were leaking into the prose, and ensures every block is perfectly formatted exactly where it belongs!

**Verification: \\\`curl\\\` and \\\`json\\\` blocks correctly rendered in sandbox:**
![Code Blocks Verification](file:///Users/konalsmac/.gemini/antigravity-ide/brain/92e7beb3-e28e-4a8a-8818-f26116a68e25/health_and_account_section_1790190731826.png)
`;

fs.writeFileSync(file, content);
console.log('Appended to walkthrough');
