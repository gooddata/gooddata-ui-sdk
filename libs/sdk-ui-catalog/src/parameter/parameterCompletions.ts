// (C) 2026 GoodData Corporation

import type { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";

import { PARAMETER_SCHEMA_KEYS } from "./parameterSchema.js";

/** Pre-built completion options from the schema key map. */
const completionOptions: Record<string, { label: string; type: string }[]> = Object.fromEntries(
    Object.entries(PARAMETER_SCHEMA_KEYS).map(([parent, keys]) => [
        parent,
        keys.map((label) => ({ label, type: "property" })),
    ]),
);

/**
 * CodeMirror completion source that suggests allowed YAML property names
 * based on the parameter zod schema and cursor position in the Lezer tree.
 */
export function parameterSchemaCompletions(context: CompletionContext): CompletionResult | null {
    const line = context.state.doc.lineAt(context.pos);
    const before = line.text.slice(0, context.pos - line.from);

    // Only trigger when typing a key name at the start of a line
    const match = before.match(/^(\s*)(\w*)$/);
    if (!match) {
        return null;
    }

    const word = match[2];
    const from = context.pos - word.length;
    const parentKey = getParentKey(context.state, context.pos);

    const options = completionOptions[parentKey];
    if (!options) {
        return null;
    }

    return { from, options };
}

/**
 * Walk up the Lezer YAML tree from cursor to find which key's BlockMapping
 * we're inside. Returns "" for the top-level mapping.
 */
function getParentKey(state: EditorState, pos: number): string {
    const tree = syntaxTree(state);
    let node = tree.resolveInner(pos, -1).parent;

    // Find the BlockMapping we're inside
    while (node) {
        if (node.name === "BlockMapping") {
            // If this BlockMapping is the value of a Pair, return the Pair's key
            const pair = node.parent;
            if (pair?.name === "Pair") {
                const keyNode = pair.getChild("Key");
                if (keyNode) {
                    return state.sliceDoc(keyNode.from, keyNode.to).trim();
                }
            }
            return "";
        }
        node = node.parent;
    }

    return "";
}
