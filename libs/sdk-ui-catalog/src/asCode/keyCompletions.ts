// (C) 2026 GoodData Corporation

import {
    type Completion,
    type CompletionContext,
    type CompletionResult,
    insertCompletionText,
} from "@codemirror/autocomplete";
import type { EditorState, Text } from "@codemirror/state";

/**
 * A completion source for a flat mapping: it offers the keys at column zero only, since an indented
 * line sits inside a sequence value (e.g. under `tags:`), where those keys must not be offered.
 */
export function createFlatKeyCompletions(keys: string[]) {
    const options = keys.map((label) => replacingKey({ label, type: "property", apply: `${label}: ` }));

    return function completeFlatKey(context: CompletionContext): CompletionResult | null {
        const line = context.state.doc.lineAt(context.pos);
        const before = line.text.slice(0, context.pos - line.from);
        const match = before.match(/^(\w*)$/);
        if (!match) {
            return null;
        }
        const present = presentTopLevelKeys(context.state.doc, line.number);
        return {
            from: context.pos - match[1].length,
            options: options.filter((option) => !present.has(option.label)),
        };
    };
}

function presentTopLevelKeys(doc: Text, exceptLine: number): Set<string> {
    const keys = new Set<string>();
    for (let number = 1; number <= doc.lines; number++) {
        if (number === exceptLine) {
            continue;
        }
        const key = /^(\w+):/.exec(doc.line(number).text)?.[1];
        if (key !== undefined) {
            keys.add(key);
        }
    }
    return keys;
}

/**
 * The result's own `to` stays at the caret because the popup filters options by the text between
 * `from` and `to`.
 */
export function replacingKey(option: Completion): Completion {
    return {
        ...option,
        apply(view, completion, from, to) {
            const end = keyReplacementEnd(view.state, to);
            const apply =
                view.state.sliceDoc(end, end + 1) === ":" ? option.label : (option.apply ?? option.label);
            if (typeof apply === "string") {
                view.dispatch(view.state.update(insertCompletionText(view.state, apply, from, end)));
            } else {
                apply(view, completion, from, end);
            }
        },
    };
}

function keyReplacementEnd(state: EditorState, pos: number): number {
    const line = state.doc.lineAt(pos);
    return pos + (/^\w*/.exec(line.text.slice(pos - line.from))?.[0].length ?? 0);
}
