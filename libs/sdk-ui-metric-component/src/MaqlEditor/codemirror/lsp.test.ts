// (C) 2026 GoodData Corporation

import { EditorState, Text } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import { DiagnosticSeverity } from "vscode-languageserver-types";

import {
    createDocument,
    diagnosticsToLint,
    offsetToPosition,
    positionToOffset,
    rangeToSpan,
    spanToRange,
    textEditsToChanges,
} from "./lsp.js";

const doc = Text.of(["SELECT SUM({fact/id})", "WHERE TRUE"]);

describe("lsp conversions", () => {
    it("converts positions to offsets and back", () => {
        expect(positionToOffset(doc, { line: 0, character: 0 })).toBe(0);
        expect(positionToOffset(doc, { line: 1, character: 6 })).toBe(doc.line(2).from + 6);
        expect(offsetToPosition(doc, doc.line(2).from + 6)).toEqual({ line: 1, character: 6 });
    });

    it("clamps positions outside the document", () => {
        expect(positionToOffset(doc, { line: 5, character: 2 })).toBe(doc.line(2).from + 2);
        expect(positionToOffset(doc, { line: 0, character: 999 })).toBe(doc.line(1).to);
        expect(offsetToPosition(doc, 999)).toEqual({ line: 1, character: doc.line(2).length });
    });

    it("converts ranges to spans and back", () => {
        const span = rangeToSpan(doc, { start: { line: 0, character: 11 }, end: { line: 0, character: 20 } });
        expect(span).toEqual({ from: 11, to: 20 });
        expect(doc.sliceString(span.from, span.to)).toBe("{fact/id}");
        expect(spanToRange(doc, span)).toEqual({
            start: { line: 0, character: 11 },
            end: { line: 0, character: 20 },
        });
    });

    it("orders a reversed range", () => {
        expect(
            rangeToSpan(doc, { start: { line: 1, character: 2 }, end: { line: 0, character: 3 } }),
        ).toEqual({ from: 3, to: doc.line(2).from + 2 });
    });

    it("turns text edits into change specs", () => {
        expect(
            textEditsToChanges(doc, [
                {
                    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 6 } },
                    newText: "select",
                },
            ]),
        ).toEqual([{ from: 0, to: 6, insert: "select" }]);
    });

    it("turns diagnostics into lint diagnostics", () => {
        expect(
            diagnosticsToLint(doc, [
                {
                    range: { start: { line: 1, character: 0 }, end: { line: 1, character: 5 } },
                    message: "unexpected",
                    severity: DiagnosticSeverity.Warning,
                    source: "maql",
                    code: 4,
                },
                {
                    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
                    message: "bad",
                },
            ]),
        ).toEqual([
            {
                from: doc.line(2).from,
                to: doc.line(2).from + 5,
                severity: "warning",
                message: "unexpected",
                source: "maql(4)",
            },
            { from: 0, to: 1, severity: "error", message: "bad", source: undefined },
        ]);
    });

    it("keeps a diagnostic without extent on its position, where Monaco drew no squiggle", () => {
        const end = doc.length;
        const [atEnd, atStart] = diagnosticsToLint(doc, [
            {
                range: { start: offsetToPosition(doc, end), end: offsetToPosition(doc, end) },
                message: "expecting more",
            },
            {
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
                message: "nothing here",
            },
        ]);

        expect([atEnd.from, atEnd.to]).toEqual([end, end]);
        expect([atStart.from, atStart.to]).toEqual([0, 0]);
    });

    it("creates a text document of the editor content", () => {
        const state = EditorState.create({ doc });
        const document = createDocument(state, "maql");
        expect(document.languageId).toBe("maql");
        expect(document.getText()).toBe(doc.toString());
        expect(document.version).toBeLessThan(createDocument(state, "maql").version);
    });
});
