// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IUnsafeHighchartsTooltipPoint } from "../../../../typings/unsafe.js";
import { markdownToHtml } from "../markdownToHtml.js";
import { resolveReferences, resolveReferencesFromPoint } from "../referenceResolver.js";

describe("resolveReferences", () => {
    it("should substitute known references", () => {
        const result = resolveReferences(
            "Profit: {metric/profit_margin}",
            {
                "metric/profit_margin": "23.5%",
            },
            "(No data)",
        );
        expect(result).toBe("Profit: 23.5%");
    });

    it("backslash-escapes parens in the fallback text so they render as literal text", () => {
        // The fallback travels through markdownToHtml just like resolved values,
        // so its metacharacters must be escaped to render literally.
        const result = resolveReferences("Value: {metric/unknown}", {}, "(No data)");
        expect(result).toBe("Value: \\(No data\\)");
    });

    it("does not escape characters that are not markdown metacharacters", () => {
        const result = resolveReferences("Value: {metric/unknown}", {}, "—");
        expect(result).toBe("Value: —");
    });

    it("should resolve multiple references", () => {
        const result = resolveReferences(
            "**{metric/profit}** in {label/region}",
            {
                "metric/profit": "$1.2M",
                "label/region": "East",
            },
            "(No data)",
        );
        expect(result).toBe("**$1.2M** in East");
    });

    it("should handle image URLs from label references", () => {
        // URLs typically contain `:` and `/` but neither is a markdown metachar,
        // so the substituted URL passes through unescaped and remains parsable
        // as an image URL by markdownToHtml.
        const result = resolveReferences(
            "![product]({label/product_image_url})",
            {
                "label/product_image_url": "https://cdn.example.com/widget.png",
            },
            "(No data)",
        );
        expect(result).toBe("![product](https://cdn.example.com/widget.png)");
    });

    it("should return empty string for empty content", () => {
        expect(resolveReferences("", {}, "(No data)")).toBe("");
    });

    it("normalizes the prefix case so {Metric/x} or {LABEL/x} resolve against lowercase-prefixed values", () => {
        const result = resolveReferences(
            "{Metric/revenue} in {LABEL/region}",
            {
                "metric/revenue": "$1M",
                "label/region": "East",
            },
            "(No data)",
        );
        expect(result).toBe("$1M in East");
    });

    it("preserves identifier case (LDM identifiers are case-sensitive)", () => {
        const result = resolveReferences(
            "{metric/Revenue}",
            {
                "metric/Revenue": "case sensitive hit",
                "metric/revenue": "wrong match",
            },
            "(No data)",
        );
        expect(result).toBe("case sensitive hit");
    });

    describe("markdown-metachar escaping in resolved values", () => {
        // Resolved values come from data and may contain markdown syntax. Without
        // escaping, those characters would be reinterpreted as formatting by
        // markdownToHtml. The escape + parser's escape-protection cycle makes the
        // characters render literally in the final tooltip.

        it("escapes asterisks so values with `*` do not become italic/bold", () => {
            const resolved = resolveReferences("Product: {label/name}", { "label/name": "5*5 promo" }, "—");
            expect(resolved).toBe("Product: 5\\*5 promo");
            expect(markdownToHtml(resolved)).toBe("<p>Product: 5*5 promo</p>");
        });

        it("escapes underscores so values with `_` do not become italic", () => {
            const resolved = resolveReferences("{label/name}", { "label/name": "_underscore_" }, "—");
            expect(markdownToHtml(resolved)).toBe("<p>_underscore_</p>");
        });

        it("escapes brackets and parens so values cannot form a fake link", () => {
            const resolved = resolveReferences(
                "{label/name}",
                { "label/name": "[anchor](https://attacker.example)" },
                "—",
            );
            // The whole thing should render as plain text — no <span> link wrapper.
            const html = markdownToHtml(resolved);
            expect(html).not.toContain("gd-viz-tooltip-custom-link");
            expect(html).toContain("[anchor](https://attacker.example)");
        });

        it("escapes `!` so values cannot inject an image with attacker-controlled src", () => {
            const resolved = resolveReferences(
                "{label/name}",
                { "label/name": "![pwn](https://attacker.example/track.png)" },
                "—",
            );
            const html = markdownToHtml(resolved);
            expect(html).not.toContain("<img");
            expect(html).toContain("![pwn](https://attacker.example/track.png)");
        });

        it("escapes literal backslashes so they survive the parser's escape protection", () => {
            const resolved = resolveReferences("Path: {label/path}", { "label/path": "C:\\Users\\me" }, "—");
            expect(markdownToHtml(resolved)).toBe("<p>Path: C:\\Users\\me</p>");
        });
    });
});

/**
 * Minimal mock builders for `IDrillEventIntersectionElement`. We construct only
 * the fields the resolver actually reads; any field not relevant is omitted.
 * The cast through `unknown` mirrors the production-code pattern at the same
 * Highcharts/SDK type boundary.
 */
function attributeIntersection(args: {
    displayFormId: string;
    attributeId: string;
    name: string;
    formattedName?: string;
}) {
    return {
        header: {
            attributeHeader: {
                identifier: args.displayFormId,
                formOf: { identifier: args.attributeId },
            },
            attributeHeaderItem: {
                name: args.name,
                formattedName: args.formattedName,
            },
        },
    } as unknown;
}

function measureIntersection(args: { localIdentifier: string; identifier?: string; format?: string }) {
    return {
        header: {
            measureHeaderItem: {
                localIdentifier: args.localIdentifier,
                identifier: args.identifier,
                format: args.format,
            },
        },
    } as unknown;
}

function point(args: {
    x?: number;
    y?: number;
    z?: number;
    value?: number;
    target?: number;
    isNullTarget?: boolean;
    drillIntersection: unknown[];
}): IUnsafeHighchartsTooltipPoint {
    return { ...args } as IUnsafeHighchartsTooltipPoint;
}

describe("resolveReferencesFromPoint", () => {
    it("returns empty values when drill intersection is empty", () => {
        const result = resolveReferencesFromPoint(point({ drillIntersection: [] }));
        expect(result).toEqual({});
    });

    it("registers attribute references under both display form and attribute identifiers", () => {
        const result = resolveReferencesFromPoint(
            point({
                drillIntersection: [
                    attributeIntersection({
                        displayFormId: "region.display",
                        attributeId: "region",
                        name: "East",
                    }),
                ],
            }),
        );
        expect(result).toEqual({
            "label/region.display": "East",
            "label/region": "East",
        });
    });

    it("prefers formattedName over name for attribute display values", () => {
        const result = resolveReferencesFromPoint(
            point({
                drillIntersection: [
                    attributeIntersection({
                        displayFormId: "month",
                        attributeId: "month",
                        name: "2026-03",
                        formattedName: "March 2026",
                    }),
                ],
            }),
        );
        expect(result["label/month"]).toBe("March 2026");
    });

    it("formats measure values using the provided format", () => {
        const result = resolveReferencesFromPoint(
            point({
                y: 1234.5,
                drillIntersection: [
                    measureIntersection({
                        localIdentifier: "revenueM",
                        identifier: "revenue",
                        format: "#,##0.00",
                    }),
                ],
            }),
        );
        expect(result["metric/revenue"]).toBe("1,234.50");
    });

    it("falls back to identifierMapping when measure header has no identifier", () => {
        const result = resolveReferencesFromPoint(
            point({
                y: 42,
                drillIntersection: [
                    measureIntersection({ localIdentifier: "revenuePoPm0", format: "#,##0" }),
                ],
            }),
            undefined,
            { measures: { revenuePoPm0: { ldmId: "revenue", pointField: "y" } } },
        );
        expect(result["metric/revenue"]).toBe("42");
    });

    it("reads each measure from the point field declared in identifierMapping", () => {
        // Bubble chart: x-axis measure on point.x, y-axis on point.y, size on point.z.
        const result = resolveReferencesFromPoint(
            point({
                x: 10,
                y: 20,
                z: 30,
                drillIntersection: [
                    measureIntersection({ localIdentifier: "mx" }),
                    measureIntersection({ localIdentifier: "my" }),
                    measureIntersection({ localIdentifier: "mz" }),
                ],
            }),
            undefined,
            {
                measures: {
                    mx: { ldmId: "revenue", pointField: "x" },
                    my: { ldmId: "profit", pointField: "y" },
                    mz: { ldmId: "size", pointField: "z" },
                },
            },
        );
        expect(result).toEqual({
            "metric/revenue": "10",
            "metric/profit": "20",
            "metric/size": "30",
        });
    });

    it("reads heatmap measure value from point.value", () => {
        const result = resolveReferencesFromPoint(
            point({
                value: 99,
                drillIntersection: [measureIntersection({ localIdentifier: "m" })],
            }),
            undefined,
            { measures: { m: { ldmId: "intensity", pointField: "value" } } },
        );
        expect(result["metric/intensity"]).toBe("99");
    });

    it("reads bullet target measure from point.target", () => {
        const result = resolveReferencesFromPoint(
            point({
                target: 80,
                drillIntersection: [measureIntersection({ localIdentifier: "tgt" })],
            }),
            undefined,
            { measures: { tgt: { ldmId: "target_metric", pointField: "target" } } },
        );
        expect(result["metric/target_metric"]).toBe("80");
    });

    it("treats bullet null target as no value (target=0 + isNullTarget)", () => {
        // Bullet encodes null targets as `target: 0` with an isNullTarget flag.
        // Without the flag check, the resolver would render the placeholder
        // zero as a real value.
        const result = resolveReferencesFromPoint(
            point({
                target: 0,
                isNullTarget: true,
                drillIntersection: [measureIntersection({ localIdentifier: "tgt" })],
            }),
            undefined,
            { measures: { tgt: { ldmId: "target_metric", pointField: "target" } } },
        );
        expect(result["metric/target_metric"]).toBeUndefined();
    });

    it("omits measure entry when no LDM identifier can be resolved", () => {
        const result = resolveReferencesFromPoint(
            point({
                y: 1,
                drillIntersection: [measureIntersection({ localIdentifier: "orphan" })],
            }),
        );
        expect(result).toEqual({});
    });

    it("omits measure entry when point.y is null", () => {
        const result = resolveReferencesFromPoint(
            point({
                y: undefined,
                drillIntersection: [
                    measureIntersection({
                        localIdentifier: "revenueM",
                        identifier: "revenue",
                        format: "#,##0",
                    }),
                ],
            }),
        );
        expect(result).toEqual({});
    });

    it("uses String(rawValue) when no format is provided", () => {
        const result = resolveReferencesFromPoint(
            point({
                y: 7,
                drillIntersection: [measureIntersection({ localIdentifier: "m", identifier: "raw" })],
            }),
        );
        expect(result["metric/raw"]).toBe("7");
    });
});
