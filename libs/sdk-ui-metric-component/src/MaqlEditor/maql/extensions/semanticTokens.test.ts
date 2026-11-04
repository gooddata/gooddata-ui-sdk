// (C) 2026 GoodData Corporation

import { Text } from "@codemirror/state";
import { describe, expect, it } from "vitest";

import { decodeSemanticTokens } from "./semanticTokens.js";

describe("decodeSemanticTokens", () => {
    const doc = Text.of(["SELECT SUM({fact/id})", "WHERE TRUE"]);
    const tokenTypes = ["keyword.maql", "function.maql", "fact.maql"];

    it("decodes the relative token encoding into classed marks", () => {
        // line, start, length, type, modifiers
        const data = [0, 0, 6, 0, 0, 0, 7, 3, 1, 0, 0, 4, 9, 2, 0, 1, 0, 5, 0, 0];
        const set = decodeSemanticTokens(doc, data, tokenTypes);
        const marks: Array<[number, number, string]> = [];
        set.between(0, doc.length, (from, to, decoration) => {
            marks.push([from, to, decoration.spec["class"] as string]);
        });

        expect(marks).toEqual([
            [0, 6, "maql-semantic-keyword"],
            [7, 10, "maql-semantic-function"],
            [11, 20, "maql-semantic-fact"],
            [doc.line(2).from, doc.line(2).from + 5, "maql-semantic-keyword"],
        ]);
    });

    it("ignores unknown types and clamps to the document", () => {
        const set = decodeSemanticTokens(doc, [0, 0, 6, 9, 0, 1, 6, 50, 0, 0], tokenTypes);
        const marks: Array<[number, number]> = [];
        set.between(0, doc.length, (from, to) => {
            marks.push([from, to]);
        });
        expect(marks).toEqual([[doc.line(2).from + 6, doc.length]]);
    });
});
