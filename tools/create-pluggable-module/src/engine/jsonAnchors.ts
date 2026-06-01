// (C) 2026 GoodData Corporation

import { findAnchorLineIdx, fullAnchor } from "./anchors.js";

/**
 * Walks back from the anchor line in a JSONC file and appends a comma to the
 * last real code line if it doesn't already end with one. Idempotent: if the
 * comma is already there (e.g. a previous scaffold added it), this is a no-op.
 *
 * JSONC requires a comma between array entries. The original `rush init-pluggable-app`
 * scripts in both gdc-ui repos did this fix-up by hand; this generalises it so any
 * profile inserting into a JSONC array can use it.
 *
 * Inline `// ...` comments after a JSON token are preserved exactly where they were —
 * the comma slots into the gap between the code part and the comment, not at end of line.
 */
export function ensureTrailingCommaBeforeAnchor(content: string, suffix?: string): string {
    const lines = content.split("\n");
    // Synthetic filename — findAnchorLineIdx's error messages need a label and this
    // helper isn't told the real path. The label only matters if the anchor is missing,
    // which can't actually happen here because checkAnchors already verified the file.
    const anchorIdx = findAnchorLineIdx(lines, `<jsonc with ${fullAnchor(suffix)}>`, suffix);

    for (let i = anchorIdx - 1; i >= 0; i--) {
        const raw = lines[i];
        const trimmed = raw.trim();
        if (!trimmed || trimmed.startsWith("//")) continue;

        const commentIdx = raw.indexOf("//");
        const codePart = commentIdx === -1 ? raw : raw.slice(0, commentIdx);
        if (!codePart.trimEnd().endsWith(",")) {
            if (commentIdx === -1) {
                lines[i] = raw.trimEnd() + ",";
            } else {
                const code = codePart.replace(/\s+$/, "");
                // Whitespace between token and `//`.
                const gap = codePart.slice(code.length);
                lines[i] = code + "," + gap + raw.slice(commentIdx);
            }
        }
        break;
    }

    return lines.join("\n");
}
