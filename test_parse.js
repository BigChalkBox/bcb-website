import fs from 'fs';
import { getApiDocsData } from './src/lib/api-docs.js';
const { sections } = await getApiDocsData();
const faq = sections.find(s => s.title.includes('FAQ'));
console.log(faq.proseHtml.substring(0, 500));
