// (C) 2026 GoodData Corporation

import { useRef, useState } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { type IUiConfigEditorApi } from "../types.js";
// Type-only, so the statement is erased and the module stays out of the registry until the dynamic
// import below puts it there.
import type { UiConfigEditor as UiConfigEditorComponent } from "../UiConfigEditor.js";

// Deliberately NO grammar preload in this file: these tests are about the window between the editor
// mounting and its lazily loaded grammar arriving. That window only exists while the grammar cache
// is cold, and the cache is a module singleton shared by every suite in the worker — a suite that
// rendered an editor earlier would leave these tests passing vacuously against a grammar that had
// already arrived. Dropping the module registry and importing the component afterwards is what buys
// a cold cache back without a test-only reset in the production module; dropping it again at the end
// hands the next file the same registry state it would have had anyway.
let UiConfigEditor: typeof UiConfigEditorComponent;

beforeAll(async () => {
    vi.resetModules();
    ({ UiConfigEditor } = await import("../UiConfigEditor.js"));
});

afterAll(() => {
    vi.resetModules();
});

function Host() {
    const [value, setValue] = useState('{"a": 1}');
    const [withCompletion, setWithCompletion] = useState(false);
    const apiRef = useRef<IUiConfigEditorApi>(null);

    return (
        <div>
            <button onClick={() => apiRef.current?.insertAtCursor("X")} data-testid="insert">
                insert
            </button>
            <button onClick={() => setWithCompletion(true)} data-testid="add-completion">
                completion
            </button>
            <pre data-testid="host-value">{value}</pre>
            <UiConfigEditor
                value={value}
                onChange={setValue}
                language="json"
                onLanguageChange={() => {}}
                completionSource={withCompletion ? () => null : undefined}
                editorRef={apiRef}
                label="Definition"
            />
        </div>
    );
}

describe("UiConfigEditor while its grammar is still loading", () => {
    it("keeps the same editor, its edits and its cursor across the grammar's arrival", async () => {
        render(<Host />);

        // The editor mounts immediately, without waiting for the grammar chunk.
        const editorBefore = document.querySelector(".cm-editor");
        expect(editorBefore).not.toBeNull();
        // …and the load window this whole file is about is genuinely open: no highlighting yet. Also
        // the guard on the cold cache above — warm, this is where the file fails instead of passing
        // vacuously.
        expect(document.querySelector(".cm-line span")).toBeNull();

        // Edit during the load window: two inserts, the second continuing after the first.
        await userEvent.click(screen.getByTestId("insert"));
        await userEvent.click(screen.getByTestId("insert"));
        expect(screen.getByTestId("host-value")).toHaveTextContent('XX{"a": 1}');

        // The grammar arrives: syntax highlighting appears as token spans inside the lines.
        await waitFor(() => {
            expect(document.querySelector(".cm-line span")).not.toBeNull();
        });

        // Same editor instance — the grammar was injected into the running view, not remounted —
        // so the caret continues from where the user left it instead of resetting to offset 0.
        expect(document.querySelector(".cm-editor")).toBe(editorBefore);
        await userEvent.click(screen.getByTestId("insert"));
        expect(screen.getByTestId("host-value")).toHaveTextContent('XXX{"a": 1}');
    });

    it("keeps the grammar through a remount that happens after the grammar arrived", async () => {
        // The remount is built from the extensions memo; were that memo not refreshed by the
        // grammar's arrival, a completion-source toggle would mount a grammar-less editor.
        render(<Host />);
        await waitFor(() => {
            expect(document.querySelector(".cm-line span")).not.toBeNull();
        });
        const editorBefore = document.querySelector(".cm-editor");

        await userEvent.click(screen.getByTestId("add-completion"));

        expect(document.querySelector(".cm-editor")).not.toBe(editorBefore);
        await waitFor(() => {
            expect(document.querySelector(".cm-line span")).not.toBeNull();
        });
    });
});
