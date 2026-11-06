// (C) 2026 GoodData Corporation

import { type Diagnostic } from "@codemirror/lint";
import { type Document, isMap, isNode, isScalar, isSeq, parseDocument } from "yaml";

import { type IUiConfigEditorDiagnostic } from "./types.js";

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
 * The diagnostics on the text, each over the value its path names, over each place the value holds
 * its part, or over the key of the path for a key target. YAML reads JSON as well, so one parse serves either displayed language. Text
 * that does not parse, and a path it does not hold, give nothing: the syntax error is reported on its
 * own.
 */
export function getPathDiagnostics(
    text: string,
    diagnostics: readonly IUiConfigEditorDiagnostic[],
): Diagnostic[] {
    if (diagnostics.length === 0) {
        return [];
    }
    // A repeated key is valid JSON (JSON.parse keeps the last), so it must not drop every diagnostic.
    const document = parseDocument(text, { uniqueKeys: false });
    if (document.errors.length > 0) {
        return [];
    }
    return diagnostics.flatMap(({ path, part, target, severity, message }): Diagnostic[] => {
        const range = target === "key" ? keyRange(document, path) : valueRange(document, path);
        if (!range) {
            return [];
        }
        const [start, end] = range;
        const parts = partRanges(text.slice(start, end), target === "key" ? undefined : part).map(
            ([from, to]): TextRange => [start + from, start + to],
        );
        const ranges: TextRange[] = parts.length > 0 ? parts : [range];
        return ranges.map(([from, to]): Diagnostic => ({ from, to, severity, message }));
    });
}

function valueRange(document: Document, path: ReadonlyArray<string | number>): TextRange | undefined {
    const node = document.getIn(path, true);
    if (!isNode(node) || !node.range) {
        return undefined;
    }
    if (node.range[0] !== node.range[1]) {
        return [node.range[0], node.range[1]];
    }
    // A blank value has no character to underline, so its key carries the mark. A blank sequence
    // item has no key of its own, so the key of the sequence stands in.
    const keyPath = isSeq(document.getIn(path.slice(0, -1), true)) ? path.slice(0, -1) : path;
    return keyRange(document, keyPath);
}

function keyRange(document: Document, path: ReadonlyArray<string | number>): TextRange | undefined {
    const parent = document.getIn(path.slice(0, -1), true);
    if (!isMap(parent)) {
        return undefined;
    }
    const key = String(path.at(-1));
    for (const pair of parent.items) {
        if (isScalar(pair.key) && String(pair.key.value) === key && pair.key.range) {
            return [pair.key.range[0], pair.key.range[1]];
        }
    }
    return undefined;
}
