// (C) 2026 GoodData Corporation

import type { CompletionContext, CompletionSource } from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";

/** @internal */
export interface IYamlPosition {
    /** Keys of the mappings enclosing the position, outermost first. */
    ancestorKeys: string[];
    /** Block-scalar (`|`, `>`) text, whose content is not YAML structure. */
    isInBlockScalar: boolean;
}

/** @internal */
export type YamlCompletionSource = (
    context: CompletionContext,
    position: IYamlPosition,
) => ReturnType<CompletionSource>;

// Sequence-item markers count as indentation: group 1 must capture every dash with the leading whitespace,
// or a key after them compares at the wrong depth.
const KEY_LINE = /^(\s*(?:-\s+)*)("[^"]*"|'[^']*'|[^\s:#][^:]*?)\s*:/;

/** @internal */
export function yamlPositionAt(state: EditorState, pos: number): IYamlPosition {
    const treeKeys: string[] = [];
    let isInBlockScalar = false;
    let anchored = false;

    for (
        let node: ReturnType<typeof syntaxTree>["topNode"] | null = syntaxTree(state).resolveInner(pos, -1);
        node !== null;
        node = node.parent
    ) {
        if (node.name === "BlockLiteralContent") {
            isInBlockScalar = true;
        }
        if (node.name !== "Pair") {
            continue;
        }
        anchored = true;
        const key = node.getChild("Key");
        // A pair whose own key spans the position is the entry being typed, not a mapping around it.
        if (key !== null && (pos < key.from || pos > key.to)) {
            treeKeys.unshift(unquote(state.sliceDoc(key.from, key.to).trim()));
        }
    }

    // With only whitespace before the cursor there is no token for the tree to place: it stops short of the
    // position, or resolves it one level out from the block the indentation continues.
    const line = state.doc.lineAt(pos);
    const hasTokenBefore = state.doc.sliceString(line.from, pos).trim() !== "";

    return {
        ancestorKeys: hasTokenBefore && anchored ? treeKeys : indentationAncestors(state, pos),
        isInBlockScalar,
    };
}

function indentationAncestors(state: EditorState, pos: number): string[] {
    const line = state.doc.lineAt(pos);
    const prefix = state.doc.sliceString(line.from, pos);
    let expected = prefix.length - prefix.trimStart().length;

    const keys: string[] = [];
    for (let number = line.number - 1; number >= 1 && expected > 0; number--) {
        const match = KEY_LINE.exec(state.doc.line(number).text);
        if (match === null || match[1].length >= expected) {
            continue;
        }
        keys.unshift(unquote(match[2]));
        expected = match[1].length;
    }
    return keys;
}

function unquote(key: string): string {
    return /^(".*"|'.*')$/.test(key) ? key.slice(1, -1) : key;
}
