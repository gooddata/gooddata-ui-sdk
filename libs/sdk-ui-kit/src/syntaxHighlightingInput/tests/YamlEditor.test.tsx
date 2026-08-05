// (C) 2026 GoodData Corporation

import { CompletionContext } from "@codemirror/autocomplete";
import { yaml } from "@codemirror/lang-yaml";
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
    return new CompletionContext(EditorState.create({ doc, extensions: [yaml()] }), pos, true);
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
