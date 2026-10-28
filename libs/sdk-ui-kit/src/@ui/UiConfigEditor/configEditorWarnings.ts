// (C) 2026 GoodData Corporation

import { type Diagnostic } from "@codemirror/lint";
import { isNode, parseDocument } from "yaml";

import { type IUiConfigEditorWarning } from "./types.js";

type TextRange = [from: number, to: number];

function partRanges(value: string, part: string | undefined): TextRange[] {
    // "" matches at every offset, so the loop below would never advance.
    if (!part) {
        return [];
    }
    const ranges: TextRange[] = [];
    for (let at = value.indexOf(part); at !== -1; at = value.indexOf(part, at + part.length)) {
        ranges.push([at, at + part.length]);
    }
    return ranges;
}

/**
 * The warnings as diagnostics on the text, each over the value its path names, or over each place the
 * value holds its part. YAML reads JSON as well, so one parse serves either displayed language. Text
 * that does not parse, and a path it does not hold, give nothing: the syntax error is reported on its
 * own.
 */
export function getWarningDiagnostics(
    text: string,
    warnings: readonly IUiConfigEditorWarning[],
): Diagnostic[] {
    if (warnings.length === 0) {
        return [];
    }
    // A repeated key is valid JSON (JSON.parse keeps the last), so it must not drop every warning.
    const document = parseDocument(text, { uniqueKeys: false });
    if (document.errors.length > 0) {
        return [];
    }
    return warnings.flatMap(({ path, part, message }): Diagnostic[] => {
        const node = document.getIn(path, true);
        if (!isNode(node) || node.range === undefined || node.range === null) {
            return [];
        }
        const [start, end] = node.range;
        const parts = partRanges(text.slice(start, end), part).map(([from, to]): TextRange => [
            start + from,
            start + to,
        ]);
        const ranges: TextRange[] = parts.length > 0 ? parts : [[start, end]];
        return ranges.map(([from, to]): Diagnostic => ({ from, to, severity: "warning", message }));
    });
}
