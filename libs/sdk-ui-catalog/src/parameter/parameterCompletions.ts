// (C) 2026 GoodData Corporation

import {
    type Completion,
    type CompletionContext,
    type CompletionResult,
    snippetCompletion,
} from "@codemirror/autocomplete";
import type { Text } from "@codemirror/state";

import type { ParameterType } from "@gooddata/sdk-model";

import { type ParameterSchemaKeys, type SchemaKeysEntry, parameterSchemaKeys } from "./parameterSchema.js";

/**
 * Creates a CodeMirror completion source that suggests allowed YAML property
 * names and `type:` values.
 *
 * The parent mapping is derived from the cursor's indentation column. Key
 * suggestions are narrowed to the declared `definition.type` when present
 * (falling back to the union of the enabled types); `type:` value suggestions
 * always offer every enabled type.
 */
export function createParameterCompletions(enabledTypes: ParameterType[]) {
    const vocabularyByType = new Map<string, CompletionVocabulary>(
        enabledTypes.map((type) => [type, toVocabulary(parameterSchemaKeys([type]))]),
    );
    const fallbackVocabulary = toVocabulary(parameterSchemaKeys(enabledTypes));
    const typeValueOptions: Record<string, Completion[]> = {
        "": [{ label: "parameter", type: "constant" }],
        definition: enabledTypes.map((label) => ({ label, type: "constant" })),
    };

    return function completeParameter(context: CompletionContext): CompletionResult | null {
        const line = context.state.doc.lineAt(context.pos);
        const before = line.text.slice(0, context.pos - line.from);

        // Trigger on a key name at the start of a line, on a key inside a sequence item, or on the
        // value of a `type:` key; the three patterns are mutually exclusive.
        const keyMatch = before.match(/^(\s*)(\w*)$/);
        const itemMatch = before.match(/^(\s*)-\s+(\w*)$/);
        const typeMatch = before.match(/^(\s*)type:\s+(\w*)$/);
        const match = keyMatch ?? itemMatch ?? typeMatch;
        if (!match) {
            return null;
        }

        const indent = match[1].length;
        const word = match[2];
        const from = context.pos - word.length;
        const parent = getParentKey(context.state.doc, line.number, indent);
        if (parent === null) {
            return null;
        }

        if (typeMatch) {
            const options = typeValueOptions[parent.key];
            return options ? { from, options } : null;
        }

        const declaredType = getDeclaredType(context.state.doc);
        const vocabulary =
            (declaredType ? vocabularyByType.get(declaredType) : undefined) ?? fallbackVocabulary;
        const entry = vocabulary[parent.key];
        // A sequence's keys are valid only inside a `- ` item; a mapping's keys only outside one.
        const inItem = itemMatch !== null || parent.inItem;
        if (!entry || (entry.kind === "sequence") !== inItem) {
            return null;
        }

        return { from, options: entry.options };
    };
}

type CompletionVocabulary = Record<string, { kind: SchemaKeysEntry["kind"]; options: Completion[] }>;

function toVocabulary(schemaKeys: ParameterSchemaKeys): CompletionVocabulary {
    return Object.fromEntries(
        Object.entries(schemaKeys).map(([parent, { kind, keys }]) => [
            parent,
            { kind, options: keys.map((key) => toKeyOption(key, schemaKeys)) },
        ]),
    );
}

function toKeyOption(label: string, schemaKeys: ParameterSchemaKeys): Completion {
    const child = schemaKeys[label];
    if (child?.kind === "sequence") {
        return snippetCompletion(`${label}:\n\t- ${child.keys[0]}: \${}`, { label, type: "property" });
    }
    return { label, type: "property" };
}

type ParentContext = { key: string; inItem: boolean };

/**
 * The key whose block a new entry at column `indent` would join: the nearest less-indented `key:` line
 * above. `key` is `""` only for the top-level mapping (`indent === 0`); the result is `null` when the
 * enclosing line is not a mapping key or an indented line has no less-indented ancestor above it (an
 * orphaned line, which is not top-level). When the nearest ancestor is a sequence item, it resolves
 * to the key owning that sequence with `inItem` set, so continuation lines inside an item
 * report the list's key (e.g. `allowedValues`). Derived purely from indentation, not from a parsed
 * syntax tree, so it also resolves the parent on a blank indented line; the flip side is that it does
 * not understand block scalars (`|`, `>`), whose literal content is scanned as if it were mapping keys.
 */
function getParentKey(doc: Text, lineNumber: number, indent: number): ParentContext | null {
    if (indent === 0) {
        return { key: "", inItem: false };
    }

    for (let number = lineNumber - 1; number >= 1; number--) {
        const text = doc.line(number).text;
        const content = text.trimStart();
        // Skip blank lines, comments, and lines indented at least as deep as the new entry.
        if (content === "" || content.startsWith("#") || text.length - content.length >= indent) {
            continue;
        }
        if (content === "-" || content.startsWith("- ")) {
            const parent = getParentKey(doc, number, text.length - content.length);
            return parent && { key: parent.key, inItem: true };
        }
        const key = content.match(/^([\w-]+):/)?.[1];
        return key === undefined ? null : { key, inItem: false };
    }

    // Indented with no less-indented ancestor: an orphaned line, not top-level.
    return null;
}

/**
 * Value of `definition.type`: the first indented `type:` line whose enclosing mapping is `definition`.
 * Resolving the parent via {@link getParentKey} keeps a `type:` nested elsewhere — under `constraints`
 * or inside a block-scalar `description` — from being mistaken for the declared parameter type.
 */
function getDeclaredType(doc: Text): string | undefined {
    for (let number = 1; number <= doc.lines; number++) {
        const match = doc.line(number).text.match(/^(\s+)type:\s*(\w+)/);
        if (match) {
            const parent = getParentKey(doc, number, match[1].length);
            if (parent?.key === "definition" && !parent.inItem) {
                return match[2];
            }
        }
    }
    return undefined;
}
