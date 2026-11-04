// (C) 2026 GoodData Corporation

import { EditorState } from "@codemirror/state";
import { EditorView, runScopeHandlers } from "@codemirror/view";
import { describe, expect, it } from "vitest";

import { shimMaqlEditor } from "../mock/editor-shim.js";

import { baseExtensions, readOnlyExtension } from "./baseExtensions.js";

shimMaqlEditor();

function createView(doc: string, selection: { anchor: number; head?: number }, readOnly = false): EditorView {
    const parent = document.createElement("div");
    document.body.appendChild(parent);

    return new EditorView({
        state: EditorState.create({
            doc,
            selection,
            extensions: [baseExtensions(), readOnlyExtension(readOnly)],
        }),
        parent,
    });
}

function pressTab(view: EditorView, shift = false): boolean {
    return runScopeHandlers(view, new KeyboardEvent("keydown", { key: "Tab", shiftKey: shift }), "editor");
}

describe("Tab", () => {
    it("inserts the indentation at the cursor", () => {
        const view = createView("SELECT 1", { anchor: 6 });

        expect(pressTab(view)).toBe(true);
        expect(view.state.doc.toString()).toBe("SELECT   1");
        expect(view.state.selection.main.head).toBe(8);

        view.destroy();
    });

    it("indents the selected lines", () => {
        const view = createView("SELECT 1\nWHERE TRUE", { anchor: 0, head: 12 });

        expect(pressTab(view)).toBe(true);
        expect(view.state.doc.toString()).toBe("  SELECT 1\n  WHERE TRUE");

        view.destroy();
    });

    it("unindents the line on Shift-Tab", () => {
        const view = createView("  SELECT 1", { anchor: 5 });

        expect(pressTab(view, true)).toBe(true);
        expect(view.state.doc.toString()).toBe("SELECT 1");

        view.destroy();
    });

    it("does nothing in a read-only editor", () => {
        const view = createView("SELECT 1", { anchor: 6 }, true);

        expect(pressTab(view)).toBe(false);
        expect(view.state.doc.toString()).toBe("SELECT 1");

        view.destroy();
    });

    it("keeps a read-only editor in the keyboard focus order", () => {
        const view = createView("SELECT 1", { anchor: 0 }, true);

        expect(view.contentDOM.getAttribute("contenteditable")).toBe("false");
        expect(view.contentDOM.getAttribute("tabindex")).toBe("0");

        view.destroy();
    });

    it("opens the find panel on Mod-f and closes it on Escape", () => {
        const view = createView("SELECT 1", { anchor: 0 });

        expect(
            runScopeHandlers(view, new KeyboardEvent("keydown", { key: "f", ctrlKey: true }), "editor"),
        ).toBe(true);
        expect(view.dom.querySelector(".cm-panel.cm-search")).not.toBeNull();

        expect(runScopeHandlers(view, new KeyboardEvent("keydown", { key: "Escape" }), "editor")).toBe(true);
        expect(view.dom.querySelector(".cm-panel.cm-search")).toBeNull();

        view.destroy();
    });

    it("leaves the text to the input method while it composes", () => {
        const view = createView("SE", { anchor: 2 });
        view.contentDOM.dispatchEvent(new Event("compositionstart"));
        expect(view.compositionStarted).toBe(true);

        expect(pressTab(view)).toBe(true);
        expect(view.state.doc.toString()).toBe("SE");

        view.destroy();
    });
});
