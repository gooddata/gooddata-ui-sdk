// (C) 2026 GoodData Corporation

import type { Completion, CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import type { Text } from "@codemirror/state";

import type { ParameterType } from "@gooddata/sdk-model";

import { parameterSchemaKeys } from "./parameterSchema.js";

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
    const keyOptionsByType = new Map<string, Record<string, Completion[]>>(
        enabledTypes.map((type) => [type, toOptions(parameterSchemaKeys([type]))]),
    );
    const fallbackKeyOptions = toOptions(parameterSchemaKeys(enabledTypes));
    const typeValueOptions: Record<string, Completion[]> = {
        "": [{ label: "parameter", type: "constant" }],
        definition: enabledTypes.map((label) => ({ label, type: "constant" })),
    };

    return function completeParameter(context: CompletionContext): CompletionResult | null {
        const line = context.state.doc.lineAt(context.pos);
        const before = line.text.slice(0, context.pos - line.from);

        // Trigger on a key name at the start of a line, or on the value of a `type:` key
        const keyMatch = before.match(/^(\s*)(\w*)$/);
        const typeMatch = keyMatch ? null : before.match(/^(\s*)type:\s+(\w*)$/);
        const match = keyMatch ?? typeMatch;
        if (!match) {
            return null;
        }

        const indent = match[1].length;
        const word = match[2];
        const parentKey = getParentKey(context.state.doc, line.number, indent);
        if (parentKey === null) {
            return null;
        }

        const declaredType = getDeclaredType(context.state.doc);
        const keyOptions =
            (declaredType ? keyOptionsByType.get(declaredType) : undefined) ?? fallbackKeyOptions;
        const options = (keyMatch ? keyOptions : typeValueOptions)[parentKey];
        if (!options) {
            return null;
        }

        return { from: context.pos - word.length, options };
    };
}

function toOptions(keyMap: Record<string, string[]>): Record<string, Completion[]> {
    return Object.fromEntries(
        Object.entries(keyMap).map(([parent, keys]) => [
            parent,
            keys.map((label) => ({ label, type: "property" })),
        ]),
    );
}

/**
 * The key whose block mapping a new entry at column `indent` would join: the
 * nearest less-indented `key:` line above. Returns "" for the top-level
 * mapping and null when the enclosing line is not a mapping key.
 */
function getParentKey(doc: Text, lineNumber: number, indent: number): string | null {
    if (indent === 0) {
        return "";
    }

    for (let number = lineNumber - 1; number >= 1; number--) {
        const text = doc.line(number).text;
        const content = text.trimStart();
        if (content === "" || content.startsWith("#") || text.length - content.length >= indent) {
            continue;
        }
        return content.match(/^([\w-]+):/)?.[1] ?? null;
    }

    return "";
}

/** Value of the first indented `type:` key, i.e. `definition.type` (the top-level `type` is unindented). */
function getDeclaredType(doc: Text): string | undefined {
    for (let number = 1; number <= doc.lines; number++) {
        const match = doc.line(number).text.match(/^\s+type:\s*(\w+)/);
        if (match) {
            return match[1];
        }
    }
    return undefined;
}
