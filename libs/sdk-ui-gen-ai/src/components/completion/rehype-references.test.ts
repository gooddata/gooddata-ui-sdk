// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { extractReferences } from "./plugins/reference-placeholder.js";
import { rehypeReferences } from "./plugins/rehype-references.js";

function classNameOf(transformed: unknown): string {
    return (
        (transformed as { children: unknown[] }).children[0] as {
            properties: { className: string };
        }
    ).properties.className;
}

describe("rehypeReferences", () => {
    it("should render label references with label css class", () => {
        const { text, tokens } = extractReferences("{label/product.name}");
        const tree = { type: "root", children: [{ type: "text", value: text }] };
        const plugin = rehypeReferences(
            [{ id: "product.name", type: "label", title: "Product Name" }],
            tokens,
        );

        expect(classNameOf(plugin()(tree as unknown as never))).toContain("label");
    });

    it("should render dashboard references with dashboard css class", () => {
        const { text, tokens } = extractReferences("{dashboard/sales-dashboard}");
        const tree = { type: "root", children: [{ type: "text", value: text }] };
        const plugin = rehypeReferences(
            [{ id: "sales-dashboard", type: "dashboard", title: "Sales Dashboard" }],
            tokens,
        );

        expect(classNameOf(plugin()(tree as unknown as never))).toContain("dashboard");
    });

    it("should render visualization references with visualization css class", () => {
        const { text, tokens } = extractReferences("{visualization/sales-viz}");
        const tree = { type: "root", children: [{ type: "text", value: text }] };
        const plugin = rehypeReferences(
            [{ id: "sales-viz", type: "visualization", title: "Sales Visualization" }],
            tokens,
        );

        expect(classNameOf(plugin()(tree as unknown as never))).toContain("visualization");
    });

    it("resolves a placeholder back to a reference whose id contains an underscore-word-underscore pattern", () => {
        const { text, tokens } = extractReferences("{metric/spend_amount_-_txn_-_cutcgco}");
        const tree = { type: "root", children: [{ type: "text", value: text }] };
        const plugin = rehypeReferences(
            [{ id: "spend_amount_-_txn_-_cutcgco", type: "metric", title: "Spend" }],
            tokens,
        );

        expect(classNameOf(plugin()(tree as unknown as never))).toContain("metric");
    });

    it("restores the original token text when no reference matches the placeholder", () => {
        const original = "Pick one: {metric/spend_amount_-_txn_-_cutcgco} or something else.";
        const { text, tokens } = extractReferences(original);
        // Sanity check: extraction actually replaced the token with a placeholder.
        expect(text).not.toBe(original);

        const tree = { type: "root", children: [{ type: "text", value: text }] };
        const plugin = rehypeReferences([], tokens);

        const result = plugin()(tree as unknown as never) as unknown as {
            children: { value: string }[];
        };

        // The original `{type/id}` token text should be restored verbatim - no bare
        // digit and no leftover invisible placeholder sentinel.
        expect(result.children[0].value).toBe(original);
    });
});
