// (C) 2026 GoodData Corporation

import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { shimMaqlEditor } from "../mock/editor-shim.js";

import { useCopyToClipboard } from "./useCopyToClipboard.js";

shimMaqlEditor();

const TEXT = "SELECT 1";

function createEditor(): EditorView {
    return new EditorView({
        state: EditorState.create({
            doc: TEXT,
            extensions: [EditorState.readOnly.of(true), EditorView.editable.of(false)],
        }),
        parent: document.body,
    });
}

function stubClipboard(writeText: ((text: string) => Promise<void>) | undefined): void {
    Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: writeText ? { writeText } : undefined,
    });
}

afterEach(() => {
    stubClipboard(undefined);
    vi.restoreAllMocks();
});

describe("useCopyToClipboard", () => {
    it("writes the content through the clipboard API and selects it", async () => {
        const writeText = vi.fn(() => Promise.resolve());
        stubClipboard(writeText);
        const editor = createEditor();
        const { result } = renderHook(() => useCopyToClipboard());

        await expect(result.current(editor)).resolves.toBe(true);

        expect(writeText).toHaveBeenCalledWith(TEXT);
        expect(editor.state.selection.main.from).toBe(0);
        expect(editor.state.selection.main.to).toBe(TEXT.length);
        editor.destroy();
    });

    it("copies from a temporary text area when the clipboard API is not there", async () => {
        stubClipboard(undefined);
        const copied: string[] = [];
        document.execCommand = vi.fn((command: string) => {
            copied.push(`${command}:${document.querySelector("textarea")?.value ?? ""}`);
            return true;
        });
        const editor = createEditor();
        const { result } = renderHook(() => useCopyToClipboard());

        await expect(result.current(editor)).resolves.toBe(true);

        expect(copied).toEqual([`copy:${TEXT}`]);
        expect(document.querySelector("textarea")).toBeNull();
        editor.destroy();
    });

    it("falls back to the legacy copy when the clipboard API rejects", async () => {
        stubClipboard(() => Promise.reject(new Error("Not allowed")));
        document.execCommand = vi.fn(() => true);
        const editor = createEditor();
        const { result } = renderHook(() => useCopyToClipboard());

        await expect(result.current(editor)).resolves.toBe(true);

        expect(document.execCommand).toHaveBeenCalledWith("copy");
        editor.destroy();
    });

    it("reports a failed copy", async () => {
        stubClipboard(undefined);
        document.execCommand = vi.fn(() => false);
        const editor = createEditor();
        const { result } = renderHook(() => useCopyToClipboard());

        await expect(result.current(editor)).resolves.toBe(false);
        editor.destroy();
    });

    it("leaves the selection alone when the content changed while the clipboard was busy", async () => {
        let finishWrite: () => void = () => undefined;
        const writeText = vi.fn(() => new Promise<void>((resolve) => (finishWrite = resolve)));
        stubClipboard(writeText);
        const editor = new EditorView({ state: EditorState.create({ doc: TEXT }), parent: document.body });
        const { result } = renderHook(() => useCopyToClipboard());

        const copy = result.current(editor);
        editor.dispatch({ changes: { from: 0, to: TEXT.length, insert: "1" } });
        finishWrite();

        await expect(copy).resolves.toBe(true);
        expect(writeText).toHaveBeenCalledWith(TEXT);
        expect(editor.state.doc.toString()).toBe("1");
        expect(editor.state.selection.main.to).toBe(0);
        editor.destroy();
    });

    it("does nothing without an editor", async () => {
        const { result } = renderHook(() => useCopyToClipboard());

        await expect(result.current(null)).resolves.toBe(false);
    });
});
