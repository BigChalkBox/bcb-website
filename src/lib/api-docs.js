import fs from 'fs';
import path from 'path';
import { Marked, marked } from 'marked';
import hljs from 'highlight.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Strip markdown syntax to get plain text for the TOC sidebar */
function stripMarkdown(text) {
    return text
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
}

/**
 * Slugify a heading text into a safe HTML id.
 * e.g. "`GET /assignments/{id}` — v1.3" → "get-assignments-id-v1-3"
 */
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * For h4 headings that describe an endpoint, e.g.:
 *   `POST /assignments/{id}/submissions` → 202
 * Wrap the HTTP method in a coloured span.
 */
function addMethodBadge(html) {
    return html.replace(
        /\b(GET|POST|PATCH|PUT|DELETE)\b/g,
        '<span class="method-$1" style="font-weight:800">$1</span>'
    ).replace(
        /class="method-(GET|POST|PATCH|PUT|DELETE)"/g,
        (_, m) => `class="method-${m.toLowerCase()}"`
    );
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function getApiDocsData() {
    const docsDir = path.join(process.cwd(), 'docs');

    // Read BOTH source files — every single line
    const integrationGuide = fs.readFileSync(
        path.join(docsDir, 'partner-api-integration-guide.md'), 'utf-8'
    );
    const reference = fs.readFileSync(
        path.join(docsDir, 'partner-api-reference.md'), 'utf-8'
    );

    const combinedMarkdown = integrationGuide + '\n\n---\n\n' + reference;

    const toc = [];
    const usedIds = new Map();

    const renderer = {
        heading(token) {
            const { depth, text } = token;

            const renderedText = marked.parseInline(text);
            const plainText   = stripMarkdown(text);

            let slug = slugify(text);
            if (!slug) slug = 'section';
            const count = usedIds.get(slug) ?? 0;
            usedIds.set(slug, count + 1);
            const id = count === 0 ? slug : `${slug}-${count + 1}`;

            // Only add h1–h3 to sidebar
            if (depth <= 3) {
                toc.push({ level: depth, id, title: plainText });
            }

            const anchorIcon = `<a href="#${id}" class="api-anchor" aria-label="Link to section">
  <svg width="14" height="14" fill="none" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0z" fill="currentColor"/>
  </svg>
</a>`;

            // For h4 (endpoint descriptions), add method badge colouring
            const displayText = depth === 4 ? addMethodBadge(renderedText) : renderedText;

            return `<h${depth} id="${id}" class="api-heading api-h${depth} group">
  ${anchorIcon}
  <span>${displayText}</span>
</h${depth}>\n`;
        },

        code(token) {
            const raw      = token.text;
            const langHint = (token.lang || '').toLowerCase().trim();

            // Mermaid sequence diagrams (Integration Guide §2)
            if (langHint === 'mermaid') {
                return `<div class="api-mermaid-block">
<pre><code class="language-mermaid">${escapeHtml(raw)}</code></pre>
</div>\n`;
            }

            // Syntax-highlighted code block
            let highlighted;
            try {
                const validLang = hljs.getLanguage(langHint) ? langHint : 'plaintext';
                highlighted = hljs.highlight(raw, { language: validLang }).value;
            } catch {
                highlighted = escapeHtml(raw);
            }

            const label = langHint || 'code';

            return `<div class="api-code-block">
  <div class="api-code-header">
    <span class="api-code-lang">${label}</span>
    <div class="api-code-dots" aria-hidden="true">
      <span></span><span></span><span></span>
    </div>
  </div>
  <pre><code class="hljs language-${langHint}">${highlighted}</code></pre>
</div>\n`;
        },

        blockquote(token) {
            const body = marked.parse(token.text || '');
            return `<blockquote class="api-blockquote">${body}</blockquote>\n`;
        },

        table(token) {
            const headerCells = token.header
                .map(cell => `<th>${marked.parseInline(cell.text)}</th>`)
                .join('');

            const bodyRows = token.rows.map(row => {
                const cells = row
                    .map((cell, i) => {
                        const content = marked.parseInline(cell.text);
                        return `<td>${content}</td>`;
                    })
                    .join('');
                return `<tr>${cells}</tr>`;
            }).join('\n');

            return `<div class="api-table-wrapper">
<table class="api-table">
  <thead><tr>${headerCells}</tr></thead>
  <tbody>${bodyRows}</tbody>
</table>
</div>\n`;
        },

        hr() {
            return `<hr class="api-divider" />\n`;
        },
    };

    // Fresh isolated Marked instance — no global state
    const instance = new Marked({ renderer });
    const htmlContent = instance.parse(combinedMarkdown);

    return { htmlContent, toc };
}
