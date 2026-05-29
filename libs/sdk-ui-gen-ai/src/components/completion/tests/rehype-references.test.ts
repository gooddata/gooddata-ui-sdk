// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { rehypeReferences } from "../plugins/rehype-references.js";

describe("rehypeReferences", () => {
    it("should render label references with label css class", () => {
        const tree = {
            type: "root",
            children: [{ type: "text", value: "{label/product.name}" }],
        };
        const plugin = rehypeReferences([{ id: "product.name", type: "label", title: "Product Name" }]);

        const transformed = plugin()(tree as unknown as never);
        const renderedReference = (
            (transformed as unknown as { children: unknown[] }).children[0] as {
                properties: { className: string };
            }
        ).properties.className;

        expect(renderedReference).toContain("label");
    });
});
