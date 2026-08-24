// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { extractReferences } from "./plugins/reference-placeholder.js";
import { remarkReferences } from "./plugins/remark-references.js";

describe("remarkReferences", () => {
    it("splits a placeholder out of surrounding text into its own node", () => {
        const { text: placeholderText } = extractReferences("Pick one: {metric/total} please");
        const tree = {
            type: "root",
            children: [{ type: "text", value: placeholderText }],
        };

        const plugin = remarkReferences();
        const transformed = plugin()(tree as unknown as never) as unknown as {
            children: { value: string }[];
        };
        const values = transformed.children.map((node) => node.value);

        expect(values).toHaveLength(3);
        expect(values[0]).toBe("Pick one: ");
        expect(values[2]).toBe(" please");
    });
});
