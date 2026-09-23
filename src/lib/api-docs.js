import fs from 'fs';
import path from 'path';
import { Marked, marked } from 'marked';
import hljs from 'highlight.js';


// ─── Helpers ────────────────────────────────────────────────────────────────

/** Strip markdown syntax to get plain text for the TOC sidebar */
function stripMarkdown(text) {
    return text
        .replace(/`([^`]+)`/g, '$1')     // inline code → text
        .replace(/\*\*([^*]+)\*\*/g, '$1') // bold → text
        .replace(/\*([^*]+)\*/g, '$1')     // italic → text
        .replace(/<[^>]+>/g, '')          // any stray HTML tags
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
}

/** 
 * Turn a heading text into a slug safe for an HTML id attribute.
 * e.g.  "`GET /assignments/{id}` — v1.3"  →  "get-assignments-id-v1-3"
 */
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/`([^`]+)`/g, '$1')       // strip backtick spans first
        .replace(/[^a-z0-9]+/g, '-')       // non-alphanum → dash
        .replace(/^-+|-+$/g, '');          // trim leading/trailing dashes
}

// ─── Main export ────────────────────────────────────────────────────────────

export async function getApiDocsData() {
    const docsDir = path.join(process.cwd(), 'docs');

    // Read BOTH source files in full — nothing skipped
    const integrationGuide = fs.readFileSync(
        path.join(docsDir, 'partner-api-integration-guide.md'), 'utf-8'
    );
    const reference = fs.readFileSync(
        path.join(docsDir, 'partner-api-reference.md'), 'utf-8'
    );

    // Combine with a clear visual separator so TOC can group them
    const combinedMarkdown = integrationGuide + '\n\n---\n\n' + reference;

    // ── Build a fresh marked instance per request so no global state leaks ──
    const toc = [];
    const usedIds = new Map(); // track duplicate slugs → append -2, -3 …

    // Build a fresh Renderer each call — avoids the global mutation bug
    const renderer = {
        heading(token) {
            const { depth, text } = token;

            // Render inline markdown (bold, code spans, em, etc.) to HTML
            const renderedText = marked.parseInline(text);
            const plainText   = stripMarkdown(text);

            // Build a collision-safe id
            let slug = slugify(text);
            if (!slug) slug = 'section';
            const count = usedIds.get(slug) ?? 0;
            usedIds.set(slug, count + 1);
            const id = count === 0 ? slug : `${slug}-${count + 1}`;

            // Only add levels 1–3 to the TOC
            if (depth <= 3) {
                toc.push({ level: depth, id, title: plainText });
            }

            // Anchor icon (only appears on hover via CSS group)
            const anchorIcon = `
<a href="#${id}" class="api-anchor" aria-label="Link to this section">
  <svg width="14" height="14" fill="none" aria-hidden="true" viewBox="0 0 16 16">
    <path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0z" fill="currentColor"/>
  </svg>
</a>`.trim();

            return `<h${depth} id="${id}" class="api-heading api-h${depth} group">
  ${anchorIcon}
  <span>${renderedText}</span>
</h${depth}>\n`;
        },

        code(token) {
            const raw      = token.text;
            const langHint = (token.lang || '').toLowerCase().trim();

            // ── Mermaid diagrams: render as a pre block with special class ──
            // (client-side mermaid.js can pick this up if you ever add it)
            if (langHint === 'mermaid') {
                return `<div class="api-mermaid-block">
<pre class="mermaid-source"><code class="language-mermaid">${escapeHtml(raw)}</code></pre>
</div>\n`;
            }

            // ── All other code blocks: syntax-highlight with highlight.js ──
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
            // Render the inner body normally, then wrap in our styled blockquote
            const body = marked.parse(token.text || '');
            return `<blockquote class="api-blockquote">${body}</blockquote>\n`;
        },

        table(token) {
            // marked v18 passes the full table token; render header + rows manually
            const headerCells = token.header
                .map(cell => `<th>${marked.parseInline(cell.text)}</th>`)
                .join('');
            const bodyRows = token.rows.map(row => {
                const cells = row
                    .map(cell => `<td>${marked.parseInline(cell.text)}</td>`)
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

    // Use a fresh marked instance (avoid global state accumulation across HMR
    // reloads in dev mode — marked.use() is additive and permanent on the
    // shared default instance)
    const instance = new Marked({ renderer });


    const htmlContent = instance.parse(combinedMarkdown);

    return { htmlContent, toc };
}

// ─── Utility ────────────────────────────────────────────────────────────────

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
