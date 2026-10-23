// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";
import { MarkupContent, Position } from "vscode-languageserver";

import { hover } from "./hover.js";
import { ldmObjects } from "./tests/metadata.test.helpers.js";

describe("metadata object hover", () => {
    const metric = ldmObjects.get("metric")[0];
    it("metric hover has MAQL expression info", () => {
        const query = `SELECT {metric/${metric.id}}`;
        const result = hover(query, Position.create(0, 10), ldmObjects);
        expect(result).not.toBe(null);
        expect(MarkupContent.is(result!.contents)).toBe(true);
        const markdownValue: string = (result!.contents as MarkupContent).value;
        expect(markdownValue).toContain(metric.expression);
    });

    it("string parameter hover has type and default info", () => {
        const query = "SELECT {parameter/scenario}";
        const result = hover(query, Position.create(0, 10), ldmObjects);
        expect(result).not.toBe(null);
        const markdownValue: string = (result!.contents as MarkupContent).value;
        expect(markdownValue).toContain('Parameter (string, default: "actual")');
    });

    it("number parameter hover has type and default info", () => {
        const query = "SELECT {parameter/topN}";
        const result = hover(query, Position.create(0, 10), ldmObjects);
        expect(result).not.toBe(null);
        const markdownValue: string = (result!.contents as MarkupContent).value;
        expect(markdownValue).toContain("Parameter (number, default: 10)");
    });
});
