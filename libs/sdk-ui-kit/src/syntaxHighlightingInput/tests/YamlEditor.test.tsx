// (C) 2026 GoodData Corporation

import { CompletionContext } from "@codemirror/autocomplete";
import { yaml } from "@codemirror/lang-yaml";
import { ensureSyntaxTree } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { YamlEditor } from "../YamlEditor.js";
import type { IYamlPosition } from "../yamlPosition.js";

const captured = vi.hoisted(() => ({ onCompletion: undefined as ((c: unknown) => unknown) | undefined }));

vi.mock("../SyntaxHighlightingInput.js", () => ({
    SyntaxHighlightingInput: ({ onCompletion }: { onCompletion?: (c: unknown) => unknown }) => {
        captured.onCompletion = onCompletion;
        return null;
    },
}));

function completionContextFor(doc: string, pos: number) {
    const state = EditorState.create({ doc, extensions: [yaml()] });
    // The initial parse only gets a 20ms budget, after which a partial tree is taken. On a loaded machine
    // that budget can lapse, leaving no Pair nodes and silently falling back to indentation heuristics.
    if (ensureSyntaxTree(state, doc.length, 5000) === null) {
        throw new Error("YAML parse did not finish; the position under test would not be tree-derived.");
    }
    return new CompletionContext(state, pos, true);
}

describe("YamlEditor completion wiring", () => {
    beforeEach(() => {
        captured.onCompletion = undefined;
    });

    it("hands the completion source the structure at the cursor", () => {
        const positions: IYamlPosition[] = [];
        render(
            <YamlEditor
                initialValue=""
                completionSource={(_context, position) => {
                    positions.push(position);
                    return null;
                }}
            />,
        );

        const doc = "layers:\n  - type: pus";
        captured.onCompletion?.(completionContextFor(doc, doc.length));

        expect(positions).toEqual([{ ancestorKeys: ["layers", "type"], isInBlockScalar: false }]);
    });

    it("passes no completion handler down when the caller supplies no source", () => {
        render(<YamlEditor initialValue="" />);

        expect(captured.onCompletion).toBeUndefined();
    });
});
