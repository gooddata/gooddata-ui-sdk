// (C) 2026 GoodData Corporation

import { useRef, useState } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { type IUiConfigEditorApi } from "../types.js";
import { UiConfigEditor } from "../UiConfigEditor.js";

// Deliberately NO grammar preload in this file: these tests are about the window between the
// editor mounting and its lazily loaded grammar arriving. A fresh test file gets a fresh module
// registry, so the grammar cache here starts cold.

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
