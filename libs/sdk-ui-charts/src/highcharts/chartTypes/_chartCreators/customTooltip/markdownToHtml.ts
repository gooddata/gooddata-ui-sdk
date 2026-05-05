// (C) 2026 GoodData Corporation

/**
 * Lightweight Markdown-to-HTML converter for tooltip rendering.
 *
 * Supports the subset of Markdown needed for tooltips:
 * - Headings (# through ####)
 * - Bold (**text** or __text__)
 * - Italic (*text* or _text_)
 * - Unordered lists (- item or * item)
 * - Ordered lists (1. item)
 * - Images (![alt](url))
 * - Links ([text](url)) — rendered as plain styled text (not clickable in tooltips)
 * - Horizontal rules (--- or ***)
 * - Line breaks
 * - Backslash escapes (\*, \_, \[, \!, etc.) — render the metachar as literal text.
 *   Used by reference resolution to keep data values that contain markdown
 *   syntax from being reinterpreted as formatting.
 *
 * Does NOT support: tables, code blocks, blockquotes, nested lists, HTML passthrough.
 * For full Markdown fidelity, a library like `marked` should be used instead.
 *
 * IMPORTANT: When changing the supported syntax here, also update the @public TSDoc
 * on `ICustomTooltipConfig.content` in sdk-ui-charts/src/interfaces/chartConfig.ts
 * so the SDK documentation matches reality.
 */

function escapeHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function isSafeUrl(url: string): boolean {
    return /^https?:\/\//i.test(url) || /^data:image\//i.test(url);
}

// URL pattern allowing one level of balanced parens, e.g.
// https://en.wikipedia.org/wiki/Page_(name)
const URL_PATTERN = "(?:[^()\\s]|\\([^)]*\\))+";
const IMAGE_REGEX = new RegExp(`!\\[([^\\]]*)\\]\\((${URL_PATTERN})\\)`, "g");
const LINK_REGEX = new RegExp(`\\[([^\\]]+)\\]\\((${URL_PATTERN})\\)`, "g");

// Italic content must have non-whitespace at both inner boundaries. This keeps
// arithmetic-style text (e.g. `5 * 3 * 2`) from being misread as italics.
const ITALIC_ASTERISK_REGEX = /\*([^\s*][^*]*[^\s*]|[^\s*])\*/g;
const ITALIC_UNDERSCORE_REGEX = /(?<!\w)_([^\s_][^_]*[^\s_]|[^\s_])_(?!\w)/g;

function processInlineMarkdown(text: string): string {
    let result = escapeHtml(text);

    // Images: ![alt](url) — inline style as fallback since tooltip renders outside normal DOM
    result = result.replace(IMAGE_REGEX, (_match, alt, url) => {
        if (!isSafeUrl(url)) {
            return `${alt}`;
        }
        return `<img src="${url}" alt="${alt}" style="max-width: 100%; display: block; margin: 4px 0;" />`;
    });

    // Links: [text](url) — render as styled text, not clickable in tooltips
    result = result.replace(LINK_REGEX, (_match, linkText) => {
        return `<span class="gd-viz-tooltip-custom-link">${linkText}</span>`;
    });

    // Bold-italic: ***text*** — must run before bold and italic so the triple
    // asterisks are consumed as a unit instead of being split across patterns.
    result = result.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");

    // Bold: **text** or __text__
    result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");

    // Italic: *text* or _text_
    result = result.replace(ITALIC_ASTERISK_REGEX, "<em>$1</em>");
    result = result.replace(ITALIC_UNDERSCORE_REGEX, "<em>$1</em>");

    return result;
}

// Backslash-escape protection: replace `\X` with a per-parse sentinel that
// survives all block- and inline-level matching, then restore it to the literal
// char at the end. The generated prefix is chosen so it does not already appear
// in the input, which prevents user-supplied sentinel-shaped text from being
// restored into raw HTML after escaping.
const ESCAPABLE_METACHARS = /\\([\\*_`\[\]()!#~+\-])/g;
const SENTINEL_PREFIX = "\u0001E";

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createSentinelPrefix(markdown: string): string {
    let index = 0;
    let prefix: string;
    do {
        prefix = `${SENTINEL_PREFIX}${index}:`;
        index += 1;
    } while (markdown.includes(prefix));
    return prefix;
}

function protectEscapes(markdown: string): { markdown: string; restore: (html: string) => string } {
    const sentinelPrefix = createSentinelPrefix(markdown);
    const escapeSentinelRe = new RegExp(`${escapeRegExp(sentinelPrefix)}([0-9a-f]+);`, "g");

    return {
        markdown: markdown.replace(
            ESCAPABLE_METACHARS,
            (_, char: string) => `${sentinelPrefix}${char.charCodeAt(0).toString(16)};`,
        ),
        restore: (html: string) =>
            // None of the escapable chars are HTML-special (`<`, `>`, `&`, `"`),
            // so a raw substitution is safe — no re-escaping needed.
            html.replace(escapeSentinelRe, (_, code: string) => String.fromCharCode(parseInt(code, 16))),
    };
}

// LRU cache: tooltip formatter is invoked on every Highcharts mousemove,
// so the same resolved content is parsed many times per second. Caching
// turns repeated calls into O(1) lookups.
const CACHE_LIMIT = 200;
const cache = new Map<string, string>();

export function markdownToHtml(markdown: string): string {
    if (!markdown) {
        return "";
    }

    const cached = cache.get(markdown);
    if (cached !== undefined) {
        // Touch: re-insert so it becomes most-recently-used.
        cache.delete(markdown);
        cache.set(markdown, cached);
        return cached;
    }

    const protectedEscapes = protectEscapes(markdown);
    const html = protectedEscapes.restore(parseMarkdown(protectedEscapes.markdown));
    cache.set(markdown, html);
    if (cache.size > CACHE_LIMIT) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) {
            cache.delete(oldest);
        }
    }
    return html;
}

function parseMarkdown(markdown: string): string {
    const lines = markdown.split("\n");
    const htmlParts: string[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;

    const closeList = () => {
        if (inUnorderedList) {
            htmlParts.push("</ul>");
            inUnorderedList = false;
        }
        if (inOrderedList) {
            htmlParts.push("</ol>");
            inOrderedList = false;
        }
    };

    for (const line of lines) {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
            closeList();
            continue;
        }

        // Horizontal rule: --- or ***  or ___
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
            closeList();
            htmlParts.push("<hr/>");
            continue;
        }

        // Headings: # through ####
        const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
        if (headingMatch) {
            closeList();
            const level = headingMatch[1].length;
            const content = processInlineMarkdown(headingMatch[2]);
            htmlParts.push(`<h${level}>${content}</h${level}>`);
            continue;
        }

        // Unordered list: - item or * item
        const ulMatch = trimmed.match(/^[-*]\s+(.+)$/);
        if (ulMatch) {
            if (inOrderedList) {
                closeList();
            }
            if (!inUnorderedList) {
                htmlParts.push("<ul>");
                inUnorderedList = true;
            }
            htmlParts.push(`<li>${processInlineMarkdown(ulMatch[1])}</li>`);
            continue;
        }

        // Ordered list: 1. item
        const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
        if (olMatch) {
            if (inUnorderedList) {
                closeList();
            }
            if (!inOrderedList) {
                htmlParts.push("<ol>");
                inOrderedList = true;
            }
            htmlParts.push(`<li>${processInlineMarkdown(olMatch[1])}</li>`);
            continue;
        }

        // Regular paragraph
        closeList();
        htmlParts.push(`<p>${processInlineMarkdown(trimmed)}</p>`);
    }

    closeList();

    return htmlParts.join("");
}
