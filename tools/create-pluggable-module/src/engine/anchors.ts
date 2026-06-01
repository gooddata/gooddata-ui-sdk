// (C) 2026 GoodData Corporation

/**
 * Anchor-based insertion. Files touched by the scaffolder carry a
 * `PLUGGABLE_APP_SCAFFOLD_ANCHOR` comment marking the insertion point. The
 * keyword is identical across file types; only the surrounding comment syntax
 * differs (`//`, `#`, etc.). Files with more than one insertion point
 * disambiguate with a parenthesised suffix — e.g.
 * `PLUGGABLE_APP_SCAFFOLD_ANCHOR (stages)`.
 */

export const ANCHOR_KEYWORD = "PLUGGABLE_APP_SCAFFOLD_ANCHOR";

export function fullAnchor(suffix?: string): string {
    return suffix ? `${ANCHOR_KEYWORD} ${suffix}` : ANCHOR_KEYWORD;
}

/**
 * Locates the line containing the anchor. Throws if zero or more-than-one
 * matches are found — the latter would mean the file's anchor disambiguation
 * is broken and would silently corrupt subsequent runs.
 */
export function findAnchorLineIdx(lines: readonly string[], filename: string, suffix?: string): number {
    const needle = fullAnchor(suffix);
    const matches: number[] = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(needle)) matches.push(i);
    }
    if (matches.length === 0) {
        throw new Error(
            `Could not find "${needle}" in ${filename}. The anchor comment must be present so ` +
                `the scaffolder knows where to insert new pluggable app entries.`,
        );
    }
    if (matches.length > 1) {
        throw new Error(
            `Found ${matches.length} lines matching "${needle}" in ${filename} (at lines ${matches
                .map((i) => i + 1)
                .join(", ")}). Each anchor must be unique — use a "(suffix)" if multiple ` +
                `insertion points are needed.`,
        );
    }
    return matches[0];
}

export function insertBeforeAnchor(
    content: string,
    filename: string,
    linesToInsert: readonly string[],
    suffix?: string,
): string {
    const lines = content.split("\n");
    const idx = findAnchorLineIdx(lines, filename, suffix);
    lines.splice(idx, 0, ...linesToInsert);
    return lines.join("\n");
}
