/**
 * Minimal TSDoc helpers for the api-extractor `docComment` strings carried in
 * *.api.json. api-documenter shows only the summary section in its Properties
 * tables (everything before the first block tag), so the guide Props tables
 * take the same cut to stay 1:1 with the reference.
 */

/** Lines of the comment body: markers and leading `*` stripped, trailing space trimmed. */
function commentLines(docComment: string): string[] {
    return docComment
        .replace(/^\s*\/\*\*?/, "")
        .replace(/\*\/\s*$/, "")
        .split("\n")
        .map((line) => line.replace(/^\s*\*\s?/, "").trimEnd());
}

/** `{@link A | b}` -> b, `{@link pkg!A.b}` -> A.b, `{@link A}` -> A; `{@inheritDoc …}` dropped. */
export function resolveInlineTags(text: string): string {
    return text
        .replace(/\{@link\s+([^}|]+?)\s*\|\s*([^}]+?)\s*\}/g, "$2")
        .replace(/\{@link\s+([^}]+?)\s*\}/g, (_m, target: string) => {
            const t = target.trim();
            if (/^https?:\/\//.test(t)) return t;
            return t.slice(t.lastIndexOf("!") + 1);
        })
        .replace(/\{@inheritDoc[^}]*\}/g, "")
        .trim();
}

/**
 * Summary paragraph(s) of a TSDoc block as one line: text before the first
 * block tag (`@remarks`, `@example`, `@public`, …), inline tags resolved,
 * whitespace collapsed.
 */
export function summaryFromDocComment(docComment: string | undefined): string {
    if (!docComment) return "";
    const summary: string[] = [];
    for (const line of commentLines(docComment)) {
        if (/^@[a-zA-Z]/.test(line.trim())) break;
        summary.push(line);
    }
    return resolveInlineTags(summary.join(" ").replace(/\s+/g, " ").trim());
}

/** True when the comment carries an `@deprecated` block tag. */
export function isDeprecated(docComment: string | undefined): boolean {
    if (!docComment) return false;
    return commentLines(docComment).some((line) => /^@deprecated\b/.test(line.trim()));
}
