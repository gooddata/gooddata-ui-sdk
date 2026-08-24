// (C) 2026 GoodData Corporation

import { useRef, useState } from "react";

import { type CompletionContext } from "@codemirror/autocomplete";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { type IYamlPosition, yamlPositionAt } from "../../syntaxHighlightingInput/yamlPosition.js";

import { preloadUiConfigEditorGrammars } from "./configEditorGrammars.js";
import { type IUiConfigEditorApi, type IUiConfigEditorProps } from "./types.js";
import { UiConfigEditor } from "./UiConfigEditor.js";

// These tests are about the completion glue — that the raw CodeMirror completion callback is resolved
// through the position reader and handed to the caller's source — not about editing. It is driven
// through the real editor and the real reader: stubbing either would mean replacing a module the
// other suites in this worker share, and the assertions below pin the wiring without depending on
// what the YAML grammar makes of any particular document.
const YAML_DOCUMENT = "layers:\n  - type: pus";

interface IConsultation {
    context: CompletionContext;
    position: IYamlPosition;
}

const consulted: IConsultation[] = [];

// The editor loads its language grammar on demand, and a completion query walks the parse tree, so
// the grammars are warmed up front.
beforeAll(() => preloadUiConfigEditorGrammars());

beforeEach(() => {
    consulted.length = 0;
});

const recordingSource: IUiConfigEditorProps["completionSource"] = (context, position) => {
    consulted.push({ context, position });
    return null;
};

/**
 * Mirrors a caller: the host owns the value, and the document is typed in through the editor's own
 * handle so the caret ends up after it rather than at offset 0, where there is no shape to resolve.
 */
function Host(editorProps: Omit<Partial<IUiConfigEditorProps>, "value" | "onChange" | "editorRef">) {
    // Starts empty: the document is typed in below, which is what leaves the caret at its end.
    const [value, setValue] = useState("");
    const apiRef = useRef<IUiConfigEditorApi>(null);

    return (
        <div>
            <button onClick={() => apiRef.current?.insertAtCursor(YAML_DOCUMENT)} data-testid="type">
                type
            </button>
            <UiConfigEditor
                primaryLanguage="yaml"
                languages={["yaml"]}
                {...editorProps}
                value={value}
                onChange={setValue}
                editorRef={apiRef}
                label="Definition"
            />
        </div>
    );
}

/**
 * Asks for completions the way the keymap's explicit trigger does, and lets the query — which
 * CodeMirror runs off the current task — settle.
 */
async function requestCompletion() {
    fireEvent.keyDown(document.querySelector(".cm-content")!, { key: "i", ctrlKey: true });
    await new Promise((resolve) => setTimeout(resolve, 50));
}

describe("UiConfigEditor completion wiring", () => {
    it("hands the completion source the position resolved at the cursor", async () => {
        render(<Host completionSource={recordingSource} />);

        // Typing the document leaves the caret at its end — `insertAtCursor` also focuses the editor,
        // which CodeMirror's completion needs before it will run a query.
        await userEvent.click(screen.getByTestId("type"));
        await requestCompletion();

        await waitFor(() => {
            expect(consulted).toHaveLength(1);
        });
        const { context, position } = consulted[0];
        // The source was consulted at the caret…
        expect(context.pos).toBe(YAML_DOCUMENT.length);
        // …and the position it received is what the reader makes of that very state and offset,
        // rather than of some other document the component happened to have at hand.
        expect(position).toEqual(yamlPositionAt(context.state, context.pos));
        // A sanity check on the resolved shape itself, holding whether the reader anchored on the
        // parse tree or fell back to the indentation: the caret sits under the `layers` mapping.
        expect(position.ancestorKeys[0]).toBe("layers");
    });

    it("consults no completion source while JSON is displayed", async () => {
        // The position reader walks a YAML parse tree, so the source is only consulted for YAML.
        // The test above is what shows this file can observe a consultation at all.
        render(
            <Host
                primaryLanguage="json"
                languages={["json", "yaml"]}
                language="json"
                onLanguageChange={() => {}}
                completionSource={recordingSource}
            />,
        );

        await userEvent.click(screen.getByTestId("type"));
        await requestCompletion();

        expect(consulted).toHaveLength(0);
    });

    it("offers no completions at all when the caller supplies no source", async () => {
        // Nothing is wired up, so the explicit trigger has no source to query and must not leave a
        // completion popup behind.
        render(<Host />);

        await userEvent.click(screen.getByTestId("type"));
        await requestCompletion();

        expect(consulted).toHaveLength(0);
        expect(document.querySelector(".cm-tooltip-autocomplete")).toBeNull();
    });
});
