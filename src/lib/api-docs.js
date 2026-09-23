import fs from 'fs';
import path from 'path';
import { Marked, marked } from 'marked';
import hljs from 'highlight.js';

// ─── Text utils ──────────────────────────────────────────────────────────────

function stripMd(t) {
    return t.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1').replace(/<[^>]+>/g, '')
            .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();
}
function slugify(t) {
    return t.toLowerCase().replace(/`([^`]+)`/g,'$1').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}
function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function methodBadge(html) {
    return html.replace(/\b(GET|POST|PATCH|PUT|DELETE)\b/g,
        m => `<span class="meth meth-${m.toLowerCase()}">${m}</span>`);
}

// ─── Code block Data ─────────────────────────────────────────────────────────

function codeBlockData(raw, lang) {
    lang = (lang || '').toLowerCase().trim();

    if (lang === 'mermaid') {
        return { isMermaid: true, html: `<div class="cb cb-mermaid"><pre><code class="language-mermaid">${esc(raw)}</code></pre></div>` };
    }
    let hi;
    try { hi = hljs.highlight(raw, { language: hljs.getLanguage(lang) ? lang : 'plaintext' }).value; }
    catch { hi = esc(raw); }
    const label = lang || 'text';
    return { isMermaid: false, label, raw, html: hi };
}

// ─── Anchor SVG (reused in heading renderer) ──────────────────────────────────

const ANCHOR_SVG = `<svg width="14" height="14" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0z" fill="currentColor"/></svg>`;

// ─── Prose renderer factory (for the left-column body of each section) ────────

function makeProseRenderer(usedIds, toc) {
    return {
        heading(token) {
            const { depth, text } = token;
            const rendHtml  = marked.parseInline(text);
            const plain     = stripMd(text);
            let slug        = slugify(text) || 'section';
            const cnt       = usedIds.get(slug) ?? 0;
            usedIds.set(slug, cnt + 1);
            const id        = cnt === 0 ? slug : `${slug}-${cnt + 1}`;
            if (depth <= 3) toc.push({ level: depth, id, title: plain });
            const display   = depth === 4 ? methodBadge(rendHtml) : rendHtml;
            return `<h${depth} id="${id}" class="dh dh${depth} group"><a href="#${id}" class="da" aria-label="§">${ANCHOR_SVG}</a><span>${display}</span></h${depth}>\n`;
        },
        table(token) {
            const ths = token.header.map(c => `<th>${marked.parseInline(c.text)}</th>`).join('');
            const trs = token.rows.map(row =>
                `<tr>${row.map(c => `<td>${marked.parseInline(c.text)}</td>`).join('')}</tr>`
            ).join('');
            return `<div class="tbl-wrap"><table class="tbl"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>\n`;
        },
        blockquote(token) {
            return `<blockquote class="bq">${marked.parse(token.text||'')}</blockquote>\n`;
        },
        hr() { return `<hr class="sect-hr"/>\n`; },
    };
}

// ─── Split combined markdown at h1 / h2 / h3 headings ────────────────────────────

function splitAtHeading(md) {
    const sections = [];
    let title = null, level = 0, lines = [];
    let inCode = false;
    for (const line of md.split('\n')) {
        if (line.trim().startsWith('```')) inCode = !inCode;
        const m3 = line.match(/^### (.+)/);
        const m2 = !m3 && line.match(/^## (.+)/);
        const m1 = !m3 && !m2 && line.match(/^# (.+)/);
        if (!inCode && (m3 || m2 || m1)) {
            if (title !== null) sections.push({ title, level, body: lines.join('\n') });
            title = (m3||m2||m1)[1].trim(); 
            level = m1 ? 1 : (m2 ? 2 : 3); 
            lines = [];
        } else {
            if (title !== null) lines.push(line);
        }
    }
    if (title !== null) sections.push({ title, level, body: lines.join('\n') });
    return sections;
}

// ─── Extract fenced code blocks from a markdown body ─────────────────────────
// Returns { proseMarkdown, codeBlocksData[] }

function extractCodes(body) {
    const blocks = [];
    // match 3- or 4-backtick fences (4-backtick used for nested markdown examples in §4.6)
    // ^ ensures we only match fences at the start of a line, preventing greedy matches across blocks
    const re = /^(`{3,4})([a-zA-Z0-9_-]*)[ \t]*\n([\s\S]*?)\n\1[ \t]*(?=\n|$)/gm;
    const prose = body.replace(re, (match, _f, lang, code) => {
        const l = (lang || '').toLowerCase().trim();
        console.log(`extractCodes found lang: '${l}'`);
        if (!l || l === 'mermaid' || l === 'prose' || l === 'markdown') {
            console.log(`Skipping extraction for ${l}`);
            return match;
        }
        blocks.push(codeBlockData(code, lang));
        return '';
    });
    return { proseMarkdown: prose.trim(), codeBlocksData: blocks };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function getApiDocsData() {
    const docsDir = path.join(process.cwd(), 'docs');
    const guide = fs.readFileSync(path.join(docsDir, 'partner-api-integration-guide.md'), 'utf-8');
    const ref   = fs.readFileSync(path.join(docsDir, 'partner-api-reference.md'), 'utf-8');
    const combined = guide + '\n\n---\n\n' + ref;

    const toc    = [];
    const usedIds = new Map();

    const rawSections = splitAtHeading(combined);

    const sections = rawSections.map(raw => {
        // Assign id to the section heading
        let slug = slugify(raw.title) || 'section';
        const cnt = usedIds.get(slug) ?? 0;
        usedIds.set(slug, cnt + 1);
        const id = cnt === 0 ? slug : `${slug}-${cnt + 1}`;

        if (raw.level <= 3) toc.push({ level: raw.level, id, title: stripMd(raw.title) });

        // Separate code blocks from prose
        const { proseMarkdown, codeBlocksData } = extractCodes(raw.body);

        // Parse prose with custom renderer (handles inner headings h4/h5, tables, blockquotes)
        const renderer = makeProseRenderer(usedIds, toc);
        const inst = new Marked({ renderer });
        
        // Render the main section heading manually since it was stripped from the body
        const rendHtml = marked.parseInline(raw.title);
        const display = raw.level === 4 ? methodBadge(rendHtml) : rendHtml;
        const headingHtml = `<h${raw.level} id="${id}" class="dh dh${raw.level} group"><a href="#${id}" class="da" aria-label="§">${ANCHOR_SVG}</a><span>${display}</span></h${raw.level}>\n`;

        const proseHtml = headingHtml + (proseMarkdown ? inst.parse(proseMarkdown) : '');

        return {
            id,
            level: raw.level,
            title:     stripMd(raw.title),
            titleHtml: marked.parseInline(raw.title),
            proseHtml,
            codeBlocksData,
            hasCode: codeBlocksData.length > 0,
        };
    });

    return { sections, toc };
}
