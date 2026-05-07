// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type TextContentObject } from "../../../model.js";
import { replaceReferences } from "../references.js";

describe("replaceReferences", () => {
    it("should match references by both type and id", () => {
        const text = "Values: {metric/total} and {attribute/total}";
        const references: TextContentObject[] = [
            { id: "total", type: "attribute", title: "Total Attribute" },
            { id: "total", type: "metric", title: "Total Metric" },
        ];

        expect(replaceReferences(text, references)).toBe("Values: Total Metric and Total Attribute");
    });

    it("should keep token unchanged when only id matches but type does not", () => {
        const text = "Value: {metric/total}";
        const references: TextContentObject[] = [
            { id: "total", type: "attribute", title: "Total Attribute" },
        ];

        expect(replaceReferences(text, references)).toBe("Value: {metric/total}");
    });
});
