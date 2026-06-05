// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { markdownToHtml } from "../markdownToHtml.js";
import { resolveReferences } from "../referenceResolver.js";
import { type ITooltipLocalizedStrings, type ResolvedReference } from "../types.js";

function strings(overrides?: Partial<ITooltipLocalizedStrings>): ITooltipLocalizedStrings {
    return { noData: "(No data)", multipleItems: "(Multiple items)", noFetch: "(No data)", ...overrides };
}

function value(text: string): ResolvedReference {
    return { kind: "value", text };
}

describe("resolveReferences", () => {
    it("should substitute known references", () => {
        const result = resolveReferences(
            "Profit: {metric/profit_margin}",
            { "metric/profit_margin": value("23.5%") },
            strings(),
        );
        expect(result).toBe("Profit: 23.5%");
    });

    it("backslash-escapes parens in the placeholder text so they render as literal text", () => {
        // Placeholders travel through markdownToHtml just like resolved values,
        // so their metacharacters must be escaped to render literally.
        const result = resolveReferences("Value: {metric/unknown}", {}, strings({ noFetch: "(No data)" }));
        expect(result).toBe("Value: \\(No data\\)");
    });

    it("does not escape characters that are not markdown metacharacters", () => {
        const result = resolveReferences("Value: {metric/unknown}", {}, strings({ noFetch: "—" }));
        expect(result).toBe("Value: —");
    });

    it("should resolve multiple references", () => {
        const result = resolveReferences(
            "**{metric/profit}** in {label/region}",
            { "metric/profit": value("$1.2M"), "label/region": value("East") },
            strings(),
        );
        expect(result).toBe("**$1.2M** in East");
    });

    it("should handle image URLs from label references", () => {
        // URLs typically contain `:` and `/` but neither is a markdown metachar,
        // so the substituted URL passes through unescaped and remains parsable
        // as an image URL by markdownToHtml.
        const result = resolveReferences(
            "![product]({label/product_image_url})",
            { "label/product_image_url": value("https://cdn.example.com/widget.png") },
            strings(),
        );
        expect(result).toBe("![product](https://cdn.example.com/widget.png)");
    });

    it("should return empty string for empty content", () => {
        expect(resolveReferences("", {}, strings())).toBe("");
    });

    it("normalizes the prefix case so {Metric/x} or {LABEL/x} resolve against lowercase-prefixed values", () => {
        const result = resolveReferences(
            "{Metric/revenue} in {LABEL/region}",
            { "metric/revenue": value("$1M"), "label/region": value("East") },
            strings(),
        );
        expect(result).toBe("$1M in East");
    });

    it("preserves identifier case (LDM identifiers are case-sensitive)", () => {
        const result = resolveReferences(
            "{metric/Revenue}",
            { "metric/Revenue": value("case sensitive hit"), "metric/revenue": value("wrong match") },
            strings(),
        );
        expect(result).toBe("case sensitive hit");
    });

    describe("reference status rendering", () => {
        it("renders an empty status as the no-data string", () => {
            const result = resolveReferences("{metric/x}", { "metric/x": { kind: "empty" } }, strings());
            expect(result).toBe("\\(No data\\)");
        });

        it("renders a multiple status as the multiple-items string", () => {
            const result = resolveReferences("{label/x}", { "label/x": { kind: "multiple" } }, strings());
            expect(result).toBe("\\(Multiple items\\)");
        });

        it("renders an error status as the could-not-retrieve string", () => {
            const result = resolveReferences(
                "{metric/x}",
                { "metric/x": { kind: "error" } },
                strings({ noFetch: "(Data could not be retrieved)" }),
            );
            expect(result).toBe("\\(Data could not be retrieved\\)");
        });

        it("renders an unknown reference (no status at this point) as could-not-retrieve, not no-data", () => {
            // A reference recognized in content but absent from the values map
            // must surface as unretrievable rather than be masked as "no data".
            const result = resolveReferences(
                "{metric/missing}",
                {},
                strings({ noFetch: "(Data could not be retrieved)" }),
            );
            expect(result).toBe("\\(Data could not be retrieved\\)");
        });
    });

    describe("markdown-metachar escaping in resolved values", () => {
        // Resolved values come from data and may contain markdown syntax. Without
        // escaping, those characters would be reinterpreted as formatting by
        // markdownToHtml. The escape + parser's escape-protection cycle makes the
        // characters render literally in the final tooltip.

        it("escapes asterisks so values with `*` do not become italic/bold", () => {
            const resolved = resolveReferences(
                "Product: {label/name}",
                { "label/name": value("5*5 promo") },
                strings(),
            );
            expect(resolved).toBe("Product: 5\\*5 promo");
            expect(markdownToHtml(resolved)).toBe("<p>Product: 5*5 promo</p>");
        });

        it("escapes underscores so values with `_` do not become italic", () => {
            const resolved = resolveReferences(
                "{label/name}",
                { "label/name": value("_underscore_") },
                strings(),
            );
            expect(markdownToHtml(resolved)).toBe("<p>_underscore_</p>");
        });

        it("escapes brackets and parens so values cannot form a fake link", () => {
            const resolved = resolveReferences(
                "{label/name}",
                { "label/name": value("[anchor](https://attacker.example)") },
                strings(),
            );
            // The whole thing should render as plain text — no <span> link wrapper.
            const html = markdownToHtml(resolved);
            expect(html).not.toContain("gd-viz-tooltip-custom-link");
            expect(html).toContain("[anchor](https://attacker.example)");
        });

        it("escapes `!` so values cannot inject an image with attacker-controlled src", () => {
            const resolved = resolveReferences(
                "{label/name}",
                { "label/name": value("![pwn](https://attacker.example/track.png)") },
                strings(),
            );
            const html = markdownToHtml(resolved);
            expect(html).not.toContain("<img");
            expect(html).toContain("![pwn](https://attacker.example/track.png)");
        });

        it("escapes literal backslashes so they survive the parser's escape protection", () => {
            const resolved = resolveReferences(
                "Path: {label/path}",
                { "label/path": value("C:\\Users\\me") },
                strings(),
            );
            expect(markdownToHtml(resolved)).toBe("<p>Path: C:\\Users\\me</p>");
        });
    });
});
