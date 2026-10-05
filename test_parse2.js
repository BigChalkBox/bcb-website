import fs from 'fs';
import { getApiDocsData } from './src/lib/api-docs.js';
const { sections } = await getApiDocsData();
const faq = sections.find(s => s.title.includes('FAQ'));
console.log(faq.proseHtml.split('</svg></a><span>10. FAQ & gotchas</span></h2>\n')[1]);
