// (C) 2026 GoodData Corporation

import { EditorSelection, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it, vi } from "vitest";

import { shimMaqlEditor } from "../mock/editor-shim.js";

import { baseExtensions, readOnlyExtension } from "./baseExtensions.js";
import { changeAllOccurrences, copySelection, cutSelection, pasteFromClipboard } from "./commands.js";

shimMaqlEditor();

// Every view a test creates: the test files share one document (isolate: false), so a view left
// behind shows up as a stray textbox in the tests of other files.
const views: EditorView[] = [];
const originalExecCommand = document.execCommand;

function createView(doc: string, selection: { anchor: number; head?: number }, readOnly = false): EditorView {
    const view = new EditorView({
        state: EditorState.create({
            doc,
            selection,
            extensions: [baseExtensions(), readOnlyExtension(readOnly)],
        }),
        parent: document.body,
    });
    views.push(view);
    return view;
}

function stubClipboard(clipboard: Partial<Clipboard> | undefined): void {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: clipboard });
}

afterEach(() => {
    views.splice(0).forEach((view) => view.destroy());
    stubClipboard(undefined);
    document.execCommand = originalExecCommand;
});

describe("changeAllOccurrences", () => {
    it("puts a cursor on every occurrence of the word at the cursor", () => {
        const view = createView("SELECT a WHERE a = 1", { anchor: 8 });

        expect(changeAllOccurrences(view)).toBe(true);
        expect(view.state.selection.ranges.map((range) => [range.from, range.to])).toEqual([
            [7, 8],
            [15, 16],
        ]);
    });

    it("puts a cursor on every occurrence of the selected text", () => {
        const view = createView("ab ab ab", { anchor: 3, head: 5 });

        expect(changeAllOccurrences(view)).toBe(true);
        expect(view.state.selection.ranges.length).toBe(3);
        expect(view.state.selection.main.from).toBe(3);
    });

    it("does nothing in a read-only editor or away from a word", () => {
        expect(changeAllOccurrences(createView("SELECT a", { anchor: 7 }, true))).toBe(false);
        expect(changeAllOccurrences(createView("SELECT  a", { anchor: 7 }))).toBe(false);
    });
});

describe("clipboard", () => {
    it("copies the selection", async () => {
        const writeText = vi.fn(() => Promise.resolve());
        stubClipboard({ writeText });
        const view = createView("SELECT a", { anchor: 0, head: 6 });

        await expect(copySelection(view)).resolves.toBe(true);
        expect(writeText).toHaveBeenCalledWith("SELECT");
        expect(view.state.doc.toString()).toBe("SELECT a");
    });

    it("copies the line of the cursor when nothing is selected, the way Monaco did", async () => {
        const writeText = vi.fn(() => Promise.resolve());
        stubClipboard({ writeText });
        const view = createView("SELECT a\nWHERE b", { anchor: 11 });

        await expect(copySelection(view)).resolves.toBe(true);
        expect(writeText).toHaveBeenCalledWith("WHERE b\n");
    });

    it("cuts the selection", async () => {
        stubClipboard({ writeText: () => Promise.resolve() });
        const view = createView("SELECT a", { anchor: 6, head: 8 });

        await expect(cutSelection(view)).resolves.toBe(true);
        expect(view.state.doc.toString()).toBe("SELECT");
        expect(view.state.selection.main.head).toBe(6);
    });

    it("cuts every selected occurrence, with a cursor left in each place", async () => {
        const writeText = vi.fn(() => Promise.resolve());
        stubClipboard({ writeText });
        const view = createView("ab ab ab", { anchor: 0, head: 2 });
        changeAllOccurrences(view);

        await expect(cutSelection(view)).resolves.toBe(true);
        expect(writeText).toHaveBeenCalledWith("ab\nab\nab");
        expect(view.state.doc.toString()).toBe("  ");
        expect(view.state.selection.ranges.map((range) => range.head)).toEqual([0, 1, 2]);
    });

    it("keeps the main cursor where the main selection was", async () => {
        stubClipboard({ writeText: () => Promise.resolve() });
        const view = createView("ab ab ab", { anchor: 3, head: 5 });
        changeAllOccurrences(view);
        expect(view.state.selection.main.from).toBe(3);

        await expect(cutSelection(view)).resolves.toBe(true);
        expect(view.state.selection.main.head).toBe(1);
    });

    it("takes the ranges that select text when the main range is only a cursor", async () => {
        const writeText = vi.fn(() => Promise.resolve());
        stubClipboard({ writeText });
        const view = createView("SELECT a", { anchor: 0 });
        view.dispatch({
            selection: EditorSelection.create([EditorSelection.range(7, 8), EditorSelection.cursor(0)], 1),
        });

        await expect(cutSelection(view)).resolves.toBe(true);
        expect(writeText).toHaveBeenCalledWith("a");
        expect(view.state.doc.toString()).toBe("SELECT ");
    });

    it("pastes the text of the clipboard over the selection", async () => {
        stubClipboard({ readText: () => Promise.resolve("b") });
        const view = createView("SELECT a", { anchor: 7, head: 8 });

        await expect(pasteFromClipboard(view)).resolves.toBe(true);
        expect(view.state.doc.toString()).toBe("SELECT b");
    });

    it("neither cuts nor pastes in a read-only editor", async () => {
        stubClipboard({ writeText: () => Promise.resolve(), readText: () => Promise.resolve("b") });
        const view = createView("SELECT a", { anchor: 0, head: 6 }, true);

        await expect(cutSelection(view)).resolves.toBe(false);
        await expect(pasteFromClipboard(view)).resolves.toBe(false);
        expect(view.state.doc.toString()).toBe("SELECT a");
    });

    it("reports a copy the browser refused", async () => {
        stubClipboard({ writeText: () => Promise.reject(new Error("Not allowed")) });
        document.execCommand = vi.fn(() => false);
        const view = createView("SELECT a", { anchor: 0, head: 6 });

        await expect(copySelection(view)).resolves.toBe(false);
        await expect(cutSelection(view)).resolves.toBe(false);
        expect(view.state.doc.toString()).toBe("SELECT a");
    });
});
