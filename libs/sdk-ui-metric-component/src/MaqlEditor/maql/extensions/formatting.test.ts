// (C) 2026 GoodData Corporation

import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { describe, expect, it } from "vitest";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

import { shimMaqlEditor } from "../../mock/editor-shim.js";

import { formatMaqlDocument, formatMaqlSelection } from "./formatting.js";

shimMaqlEditor();

const DOC = "select 1";

function createView(readOnly = false): EditorView {
    const parent = document.createElement("div");
    document.body.appendChild(parent);

    return new EditorView({
        state: EditorState.create({
            doc: DOC,
            selection: { anchor: 0, head: 6 },
            extensions: [EditorState.readOnly.of(readOnly)],
        }),
        parent,
    });
}

const formatting = {
    doFormat: () =>
        Promise.resolve([
            {
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 6 } },
                newText: "SELECT",
            },
        ]),
    doFormatRange: () =>
        Promise.resolve([
            {
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 6 } },
                newText: "SELECT",
            },
        ]),
} as unknown as MaqlLanguageService;

const failing = {
    doFormat: () => Promise.reject(new Error("formatting failed")),
    doFormatRange: () => Promise.reject(new Error("formatting failed")),
} as unknown as MaqlLanguageService;

describe("formatMaqlDocument", () => {
    it("applies the edits of the language service", async () => {
        const view = createView();

        await expect(formatMaqlDocument(view, formatting)).resolves.toBe(true);
        expect(view.state.doc.toString()).toBe("SELECT 1");

        view.destroy();
    });

    it("leaves a read-only editor alone", async () => {
        const view = createView(true);

        await expect(formatMaqlDocument(view, formatting)).resolves.toBe(false);
        expect(view.state.doc.toString()).toBe(DOC);

        view.destroy();
    });

    it("reports a failed request instead of throwing", async () => {
        const view = createView();

        await expect(formatMaqlDocument(view, failing)).resolves.toBe(false);
        expect(view.state.doc.toString()).toBe(DOC);

        view.destroy();
    });
});

describe("formatMaqlSelection", () => {
    it("applies the edits of the language service", async () => {
        const view = createView();

        await expect(formatMaqlSelection(view, formatting)).resolves.toBe(true);
        expect(view.state.doc.toString()).toBe("SELECT 1");

        view.destroy();
    });

    it("reports a failed request instead of throwing", async () => {
        const view = createView();

        await expect(formatMaqlSelection(view, failing)).resolves.toBe(false);
        expect(view.state.doc.toString()).toBe(DOC);

        view.destroy();
    });
});
