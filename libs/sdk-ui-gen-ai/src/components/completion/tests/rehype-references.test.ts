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

    it("should render dashboard references with dashboard css class", () => {
        const tree = {
            type: "root",
            children: [{ type: "text", value: "{dashboard/sales-dashboard}" }],
        };
        const plugin = rehypeReferences([
            { id: "sales-dashboard", type: "dashboard", title: "Sales Dashboard" },
        ]);

        const transformed = plugin()(tree as unknown as never);
        const renderedReference = (
            (transformed as unknown as { children: unknown[] }).children[0] as {
                properties: { className: string };
            }
        ).properties.className;

        expect(renderedReference).toContain("dashboard");
    });

    it("should render visualization references with visualization css class", () => {
        const tree = {
            type: "root",
            children: [{ type: "text", value: "{visualization/sales-viz}" }],
        };
        const plugin = rehypeReferences([
            { id: "sales-viz", type: "visualization", title: "Sales Visualization" },
        ]);

        const transformed = plugin()(tree as unknown as never);
        const renderedReference = (
            (transformed as unknown as { children: unknown[] }).children[0] as {
                properties: { className: string };
            }
        ).properties.className;

        expect(renderedReference).toContain("visualization");
    });
});
