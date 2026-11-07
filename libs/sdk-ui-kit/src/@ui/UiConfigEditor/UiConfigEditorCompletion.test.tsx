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
function Host({
    yaml = YAML_DOCUMENT,
    ...editorProps
}: Omit<Partial<IUiConfigEditorProps>, "value" | "onChange" | "editorRef"> & { yaml?: string }) {
    // Starts empty: the document is typed in below, which is what leaves the caret at its end.
    const [value, setValue] = useState("");
    const apiRef = useRef<IUiConfigEditorApi>(null);

    return (
        <div>
            <button onClick={() => apiRef.current?.insertAtCursor(yaml)} data-testid="type">
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

describe("UiConfigEditor Enter key", () => {
    it("opens the completions on the new line Enter starts", async () => {
        render(<Host completionSource={recordingSource} />);
        await userEvent.click(screen.getByTestId("type"));

        fireEvent.keyDown(document.querySelector(".cm-content")!, { key: "Enter" });
        await new Promise((resolve) => setTimeout(resolve, 50));

        const lines = Array.from(document.querySelectorAll(".cm-line"), (line) => line.textContent);
        expect(lines).toEqual(["layers:", "  - type: pus", "    "]);
        await waitFor(() => {
            expect(consulted).toHaveLength(1);
        });
        expect(consulted[0].context.pos).toBe(YAML_DOCUMENT.length + "\n    ".length);
    });

    it("accepts the selected completion when the popup is open, without a line break", async () => {
        const offeringSource: IUiConfigEditorProps["completionSource"] = (context) => ({
            from: context.pos - "pus".length,
            options: [{ label: "pushpin" }],
        });
        render(<Host completionSource={offeringSource} />);
        await userEvent.click(screen.getByTestId("type"));
        await requestCompletion();
        await waitFor(() => {
            expect(document.querySelector(".cm-tooltip-autocomplete")).not.toBeNull();
        });
        // CodeMirror ignores Enter for 75ms after the popup opens, so a keystroke in flight when it
        // opened does not accept a completion the user never saw.
        await new Promise((resolve) => setTimeout(resolve, 100));

        fireEvent.keyDown(document.querySelector(".cm-content")!, { key: "Enter" });

        const lines = Array.from(document.querySelectorAll(".cm-line"), (line) => line.textContent);
        expect(lines).toEqual(["layers:", "  - type: pushpin"]);
    });

    it("adds a blank line without reopening the popup on a repeated Enter", async () => {
        render(<Host completionSource={recordingSource} />);
        await userEvent.click(screen.getByTestId("type"));
        const content = document.querySelector(".cm-content")!;

        fireEvent.keyDown(content, { key: "Enter" });
        await waitFor(() => {
            expect(consulted).toHaveLength(1);
        });
        fireEvent.keyDown(content, { key: "Escape" });
        fireEvent.keyDown(content, { key: "Enter" });
        await new Promise((resolve) => setTimeout(resolve, 50));

        const lines = Array.from(document.querySelectorAll(".cm-line"), (line) => line.textContent);
        expect(lines).toEqual(["layers:", "  - type: pus", "", "    "]);
        expect(consulted).toHaveLength(1);
    });

    it("only breaks the line when the split carries text onto the new line", async () => {
        render(<Host completionSource={recordingSource} yaml="title: Q3 report" />);
        await userEvent.click(screen.getByTestId("type"));
        const content = document.querySelector(".cm-content")!;

        for (let i = 0; i < "report".length; i++) {
            fireEvent.keyDown(content, { key: "ArrowLeft" });
        }
        fireEvent.keyDown(content, { key: "Enter" });
        await new Promise((resolve) => setTimeout(resolve, 50));

        const lines = Array.from(document.querySelectorAll(".cm-line"), (line) => line.textContent);
        expect(lines).toEqual(["title: Q3 ", "report"]);
        expect(consulted).toHaveLength(0);
    });

    it("only breaks the line when the caller supplies no source", async () => {
        render(<Host />);
        await userEvent.click(screen.getByTestId("type"));

        fireEvent.keyDown(document.querySelector(".cm-content")!, { key: "Enter" });
        await new Promise((resolve) => setTimeout(resolve, 50));

        const lines = Array.from(document.querySelectorAll(".cm-line"), (line) => line.textContent);
        expect(lines).toEqual(["layers:", "  - type: pus", "    "]);
        expect(document.querySelector(".cm-tooltip-autocomplete")).toBeNull();
    });
});

describe("UiConfigEditor indentation", () => {
    async function pressEnterAfter(yaml: string) {
        render(<Host yaml={yaml} />);
        await userEvent.click(screen.getByTestId("type"));

        fireEvent.keyDown(document.querySelector(".cm-content")!, { key: "Enter" });

        return Array.from(document.querySelectorAll(".cm-line"), (line) => line.textContent);
    }

    it("indents the new line after an empty key", async () => {
        expect(await pressEnterAfter("parameter:\n  constraints:")).toEqual([
            "parameter:",
            "  constraints:",
            "    ",
        ]);
    });

    it("indents the new line after a bare dash", async () => {
        expect(await pressEnterAfter("items:\n  -")).toEqual(["items:", "  -", "    "]);
    });

    it("indents the new line after an empty key in a list item", async () => {
        expect(await pressEnterAfter("parameter:\n  - constraints:")).toEqual([
            "parameter:",
            "  - constraints:",
            "      ",
        ]);
    });

    it("indents the new line after an empty quoted key", async () => {
        expect(await pressEnterAfter('constraints:\n  "max":')).toEqual(["constraints:", '  "max":', "    "]);
    });

    it("keeps the column after a key with a value", async () => {
        expect(await pressEnterAfter("constraints:\n  max: 5")).toEqual(["constraints:", "  max: 5", "  "]);
    });

    it("keeps the column after a key followed by a comment", async () => {
        expect(await pressEnterAfter("constraints:\n  max: # todo")).toEqual([
            "constraints:",
            "  max: # todo",
            "  ",
        ]);
    });

    it("indents the new line after a blank line below an empty block key", async () => {
        expect(await pressEnterAfter("parameter:\n  constraints:\n")).toEqual([
            "parameter:",
            "  constraints:",
            "",
            "    ",
        ]);
    });

    it("keeps the column after a comment that ends with a colon", async () => {
        expect(await pressEnterAfter("parameter:\n  # Constraints:")).toEqual([
            "parameter:",
            "  # Constraints:",
            "  ",
        ]);
    });

    it("keeps the column inside a block literal", async () => {
        expect(await pressEnterAfter("description: |\n  Allowed values:")).toEqual([
            "description: |",
            "  Allowed values:",
            "  ",
        ]);
    });
});

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
