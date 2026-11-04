// (C) 2026 GoodData Corporation

import { Text } from "@codemirror/state";
import { describe, expect, it } from "vitest";

import { type IDecoration } from "@gooddata/sdk-maql-language-server";

import { buildDecorations } from "./decorations.js";

function range(startLine: number, startChar: number, endLine: number, endChar: number) {
    return { start: { line: startLine, character: startChar }, end: { line: endLine, character: endChar } };
}

describe("buildDecorations", () => {
    const doc = Text.of(['SELECT SUM({metric/test}) WHERE {attr/test} = "test"']);
    const decorations = [
        { range: range(0, 11, 0, 24), options: { label: "Metric", type: "metric" } },
        { range: range(0, 32, 0, 43), options: { label: "Attribute", type: "attribute" } },
    ] as IDecoration[];

    it("adds a badge before each reference and marks the reference", () => {
        const set = buildDecorations(doc, decorations);
        const found: Array<{ from: number; to: number; className: string | undefined; label?: string }> = [];

        set.between(0, doc.length, (from, to, decoration) => {
            const widget = decoration.spec["widget"] as { toDOM?: () => HTMLElement } | undefined;
            found.push({
                from,
                to,
                className: decoration.spec["class"] as string | undefined,
                label: widget?.toDOM?.().textContent ?? undefined,
            });
        });

        expect(found).toEqual([
            { from: 11, to: 11, className: undefined, label: " Metric " },
            { from: 11, to: 24, className: "decorator-item metric", label: undefined },
            { from: 32, to: 32, className: undefined, label: " Attribute " },
            { from: 32, to: 43, className: "decorator-item attribute", label: undefined },
        ]);
    });

    it("classes the badge by the decoration type", () => {
        const set = buildDecorations(doc, decorations);
        const classes: string[] = [];
        set.between(11, 11, (_from, _to, decoration) => {
            const widget = decoration.spec["widget"] as { toDOM: () => HTMLElement } | undefined;
            if (widget) {
                classes.push(widget.toDOM().className);
            }
        });
        expect(classes).toEqual(["decorator metric"]);
    });

    it("falls back to the unknown type and skips empty ranges", () => {
        const set = buildDecorations(doc, [
            { range: range(0, 0, 0, 6), options: { label: "?", type: "mystery" } },
            { range: range(0, 7, 0, 7), options: { label: "empty", type: "metric" } },
        ] as unknown as IDecoration[]);
        const classes: string[] = [];
        set.between(0, doc.length, (_from, _to, decoration) => {
            const className = decoration.spec["class"] as string | undefined;
            if (className) {
                classes.push(className);
            }
        });
        expect(classes).toEqual(["decorator-item unknown"]);
    });
});
