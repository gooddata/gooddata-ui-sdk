// (C) 2026 GoodData Corporation

import { type IndentContext, getIndentUnit, indentService, syntaxTree } from "@codemirror/language";
import { type Extension } from "@codemirror/state";

/**
 * lang-yaml keeps the column after an empty `key:` or a bare `-`. Both start a nested value one
 * level deeper, so the new line is indented. An empty key that takes a scalar gets the same indent,
 * which one Backspace undoes; a schema-driven list of block keys would be harder to predict.
 */
export function yamlBlockIndent(): Extension {
    return indentService.of(indentAfterOpenBlock);
}

const TEXT_NODES = new Set(["Comment", "BlockLiteralContent", "QuotedLiteral"]);

function indentAfterOpenBlock(context: IndentContext, pos: number): number | undefined {
    let at = pos - 1;
    while (at >= 0) {
        const line = context.lineAt(at, -1);
        const text = line.text.trimEnd();
        if (text !== "") {
            const node = syntaxTree(context.state).resolveInner(line.from + text.length, -1);
            if (TEXT_NODES.has(node.name) || !opensBlock(text)) {
                return undefined;
            }
            return blockColumn(text) + getIndentUnit(context.state);
        }
        at = line.from - 1;
    }
    return undefined;
}

function opensBlock(text: string): boolean {
    return /^\s*-$/.test(text) || /^\s*(?:-\s+)*("[^"]*"|'[^']*'|[^\s:]+):$/.test(text);
}

function blockColumn(text: string): number {
    return /^\s*(?:-\s+)*/.exec(text)?.[0].length ?? 0;
}
