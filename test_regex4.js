import { getApiDocsData } from './src/lib/api-docs.js';
getApiDocsData().then(data => {
  data.sections.forEach(s => {
    s.codeBlocksHtml.forEach(c => {
      if (c.includes('#### `GET')) {
         console.log("FOUND PROSE IN CODE BLOCK IN SECTION:", s.title);
         console.log(c.substring(0, 300));
      }
    });
  });
});
