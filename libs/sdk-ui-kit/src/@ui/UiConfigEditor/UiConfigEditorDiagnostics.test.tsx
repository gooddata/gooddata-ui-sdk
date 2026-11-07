// (C) 2026 GoodData Corporation

import { useEffect, useState } from "react";

import { forEachDiagnostic } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import { act, render, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";

import { type YamlCompletionSource } from "../../syntaxHighlightingInput/yamlPosition.js";

import { preloadUiConfigEditorGrammars } from "./configEditorGrammars.js";
import { type IUiConfigEditorDiagnostic } from "./types.js";
import { UiConfigEditor } from "./UiConfigEditor.js";

beforeAll(() => preloadUiConfigEditorGrammars());

const VALUE = JSON.stringify({ title: "Q3", style: { color: "{theme.colors.texts.nope}" } }, null, 4);

function editorView(container: HTMLElement): EditorView | null {
    const editor = container.querySelector<HTMLElement>(".cm-editor");
    return editor ? EditorView.findFromDOM(editor) : null;
}

function shownDiagnostics(container: HTMLElement): string[] {
    const view = editorView(container);
    const shown: string[] = [];
    if (view) {
        forEachDiagnostic(view.state, (diagnostic, from, to) => {
            shown.push(`${diagnostic.severity}: ${view.state.sliceDoc(from, to)} ${diagnostic.message}`);
        });
    }
    return shown;
}

function editor(diagnostics: IUiConfigEditorDiagnostic[], completionSource?: YamlCompletionSource) {
    return (
        <UiConfigEditor
            value={VALUE}
            onChange={() => {}}
            diagnostics={diagnostics}
            completionSource={completionSource}
        />
    );
}

const WARNING: IUiConfigEditorDiagnostic = {
    path: ["style", "color"],
    severity: "warning",
    message: "Not in the theme.",
};

// Waits out the editor's 750 ms lint delay with room to spare.
const LINTED = { timeout: 3000 };

function RerenderingEditor() {
    const [renders, setRenders] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setRenders((renders) => renders + 1), 200);
        return () => clearInterval(interval);
    }, []);
    return (
        <UiConfigEditor
            value={VALUE}
            onChange={() => {}}
            diagnostics={renders === 0 ? [] : [{ ...WARNING }]}
            labels={{ syntaxError: "Syntax error" }}
        />
    );
}

describe("UiConfigEditor diagnostics", () => {
    it("shows the caller's warnings, and shows them again when they change", async () => {
        const { container, rerender } = render(editor([]));
        expect(shownDiagnostics(container)).toEqual([]);

        rerender(editor([WARNING]));

        await waitFor(
            () =>
                expect(shownDiagnostics(container)).toEqual([
                    'warning: "{theme.colors.texts.nope}" Not in the theme.',
                ]),
            LINTED,
        );
    });

    it("shows an error as an error", async () => {
        const { container } = render(editor([{ path: ["title"], severity: "error", message: "Unknown." }]));

        await waitFor(() => expect(shownDiagnostics(container)).toEqual(['error: "Q3" Unknown.']), LINTED);
    });

    it("keeps showing the warnings in an editor remounted for a completion source", async () => {
        const { container, rerender } = render(editor([]));
        rerender(editor([WARNING]));
        await waitFor(() => expect(shownDiagnostics(container)).toHaveLength(1), LINTED);

        rerender(editor([WARNING], () => null));

        await waitFor(() => expect(shownDiagnostics(container)).toHaveLength(1), LINTED);
    });

    it("keeps linting while the caller re-renders with new warnings of the same content", async () => {
        const { container } = render(<RerenderingEditor />);

        act(() => editorView(container)?.dispatch({ changes: { from: 1, insert: "," } }));

        const hasSyntaxError = () => shownDiagnostics(container).some((shown) => shown.startsWith("error:"));
        await waitFor(() => expect(hasSyntaxError()).toBe(true), LINTED);
    });
});
