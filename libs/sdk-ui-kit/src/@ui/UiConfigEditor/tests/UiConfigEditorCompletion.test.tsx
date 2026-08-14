// (C) 2026 GoodData Corporation

import { CompletionContext } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { render } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { IYamlPosition } from "../../../syntaxHighlightingInput/yamlPosition.js";
import { preloadUiConfigEditorGrammars } from "../configEditorGrammars.js";
import { UiConfigEditor } from "../UiConfigEditor.js";

const captured = vi.hoisted(() => ({ onCompletion: undefined as ((c: unknown) => unknown) | undefined }));

// The editor itself is mocked away: these tests are about the completion glue — that the raw
// CodeMirror completion callback is resolved through the position reader and handed to the caller's
// source — not about editing.
vi.mock("../../../syntaxHighlightingInput/SyntaxHighlightingInput.js", () => ({
    SyntaxHighlightingInput: ({ onCompletion }: { onCompletion?: (c: unknown) => unknown }) => {
        captured.onCompletion = onCompletion;
        return null;
    },
}));

// The position reader is mocked too: its actual tree walk has its own suite (yamlPosition.test.ts),
// and driving it through a hand-built editor state here proved environment-sensitive — whether the
// state's parse tree is visible to the walker depends on module layout and parse budgets, not on
// anything this component controls.
const SENTINEL_POSITION: IYamlPosition = { ancestorKeys: ["from", "the", "reader"], isInBlockScalar: false };
const yamlPositionAtMock = vi.hoisted(() => vi.fn());
vi.mock("../../../syntaxHighlightingInput/yamlPosition.js", () => ({
    yamlPositionAt: yamlPositionAtMock,
}));

const noop = () => {};

// The editor loads its language grammar on demand; tests assert on a fully initialized editor
// synchronously, so the grammars are warmed up front.
beforeAll(() => preloadUiConfigEditorGrammars());

describe("UiConfigEditor completion wiring", () => {
    beforeEach(() => {
        captured.onCompletion = undefined;
        yamlPositionAtMock.mockReset().mockReturnValue(SENTINEL_POSITION);
    });

    it("hands the completion source the position resolved at the cursor", () => {
        const positions: IYamlPosition[] = [];
        render(
            <UiConfigEditor
                value=""
                onChange={noop}
                primaryLanguage="yaml"
                languages={["yaml"]}
                completionSource={(_context, position) => {
                    positions.push(position);
                    return null;
                }}
            />,
        );

        const state = EditorState.create({ doc: "layers:\n  - type: pus" });
        captured.onCompletion?.(new CompletionContext(state, 21, true));

        // The reader was consulted with the completion's own state and position…
        expect(yamlPositionAtMock).toHaveBeenCalledWith(state, 21);
        // …and its answer is what the caller's source receives.
        expect(positions).toEqual([SENTINEL_POSITION]);
    });

    it("passes no completion handler down when the caller supplies no source", () => {
        render(<UiConfigEditor value="" onChange={noop} primaryLanguage="yaml" languages={["yaml"]} />);

        expect(captured.onCompletion).toBeUndefined();
    });

    it("passes no completion handler down while JSON is displayed", () => {
        // The position reader walks a YAML parse tree, so the source is only consulted for YAML.
        render(
            <UiConfigEditor
                value=""
                onChange={noop}
                language="json"
                onLanguageChange={noop}
                completionSource={() => null}
            />,
        );

        expect(captured.onCompletion).toBeUndefined();
    });
});
