// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef, newAttribute, newBucket, newInsightDefinition, newMeasure } from "@gooddata/sdk-model";
import { type LineShape } from "@gooddata/sdk-ui-charts";

import { chartConfigFromInsight } from "./chartCodeGenUtils.js";
import { ColumnChartDescriptor } from "./columnChart/ColumnChartDescriptor.js";
import { LineChartDescriptor } from "./lineChart/LineChartDescriptor.js";

describe("chartConfigFromInsight", () => {
    const customTooltip = {
        enabled: true,
        content: "**{metric/amount}** in {label/region}",
        placement: "above",
    };

    const insight = newInsightDefinition("local:column", (b) =>
        b.properties({
            controls: {
                customTooltip,
                unsupportedControl: { foo: "bar" },
            },
        }),
    );

    it("includes customTooltip from insight controls", () => {
        expect(chartConfigFromInsight(insight).customTooltip).toEqual(customTooltip);
    });

    it("strips controls outside the supported allowlist", () => {
        expect(chartConfigFromInsight(insight)).not.toHaveProperty("unsupportedControl");
    });

    it("generates embedding code with customTooltip config", () => {
        const code = new ColumnChartDescriptor().getEmbeddingCode(insight, { language: "ts" });

        expect(code).toContain("customTooltip");
        expect(code).toContain("**{metric/amount}** in {label/region}");
    });

    it.each(["linear", "spline", "stepped"] satisfies LineShape[])(
        "should generate chart config with the `%s` line shape in embedding code when the insight has it",
        (lineShape) => {
            const insight = newInsightDefinition("local:line", (b) =>
                b.properties({ controls: { lineShape } }),
            );
            const expected = { lineShape };

            const actual = chartConfigFromInsight(insight);

            expect(actual).toMatchObject(expected);
        },
    );

    it("should generate chart without line shape in embedding code if the insight has none", () => {
        const insight = newInsightDefinition("local:line");

        const actual = chartConfigFromInsight(insight);

        expect(actual).not.toHaveProperty("lineShape");
    });
});

describe("chartConfigFromInsight with lineStyleMapping", () => {
    function styledLineInsight(lineStyleMapping: Array<Record<string, unknown>>) {
        return newInsightDefinition("local:line", (b) =>
            b
                .buckets([
                    newBucket(
                        "measures",
                        newMeasure(idRef("won", "measure"), (m) => m.localId("a1b2c3d4e5f6won")),
                    ),
                    newBucket(
                        "trend",
                        newAttribute(idRef("year", "displayForm"), (a) => a.localId("a1b2c3d4e5f6year")),
                    ),
                ])
                .properties({ controls: { lineStyleMapping } }),
        );
    }

    it("includes lineStyleMapping from insight controls", () => {
        const insight = styledLineInsight([{ id: "a1b2c3d4e5f6won", lineStyle: "dashed", lineWidth: 1 }]);

        expect(chartConfigFromInsight(insight).lineStyleMapping).toEqual([
            { id: "a1b2c3d4e5f6won", lineStyle: "dashed", lineWidth: 1 },
        ]);
    });

    it("generates embedding code with lineStyleMapping keyed by the generated measure local identifier", () => {
        const insight = styledLineInsight([{ id: "a1b2c3d4e5f6won", lineStyle: "dashed", lineWidth: 1 }]);

        const code = new LineChartDescriptor().getEmbeddingCode(insight, { language: "ts" });

        expect(code).toContain('m.localId("m_won")');
        expect(code).toMatch(
            /lineStyleMapping:\s*\[\s*\{\s*id: "m_won",\s*lineStyle: "dashed",\s*lineWidth: 1\s*\}\s*\]/,
        );
    });

    it("keeps attribute element ids of segment line styles in the generated code", () => {
        const insight = styledLineInsight([{ id: "Direct Sales", lineStyle: "dotted", lineWidth: 4 }]);

        const code = new LineChartDescriptor().getEmbeddingCode(insight, { language: "ts" });

        expect(code).toMatch(
            /lineStyleMapping:\s*\[\s*\{\s*id: "Direct Sales",\s*lineStyle: "dotted",\s*lineWidth: 4\s*\}\s*\]/,
        );
    });
});

describe("chartConfigFromInsight with lineStyleMapping", () => {
    function styledLineInsight(lineStyleMapping: Array<Record<string, unknown>>) {
        return newInsightDefinition("local:line", (b) =>
            b
                .buckets([
                    newBucket(
                        "measures",
                        newMeasure(idRef("won", "measure"), (m) => m.localId("a1b2c3d4e5f6won")),
                    ),
                    newBucket(
                        "trend",
                        newAttribute(idRef("year", "displayForm"), (a) => a.localId("a1b2c3d4e5f6year")),
                    ),
                ])
                .properties({ controls: { lineStyleMapping } }),
        );
    }

    it("includes lineStyleMapping from insight controls", () => {
        const insight = styledLineInsight([{ id: "a1b2c3d4e5f6won", lineStyle: "dashed", lineWidth: 1 }]);

        expect(chartConfigFromInsight(insight).lineStyleMapping).toEqual([
            { id: "a1b2c3d4e5f6won", lineStyle: "dashed", lineWidth: 1 },
        ]);
    });

    it("generates embedding code with lineStyleMapping keyed by the generated measure local identifier", () => {
        const insight = styledLineInsight([{ id: "a1b2c3d4e5f6won", lineStyle: "dashed", lineWidth: 1 }]);

        const code = new LineChartDescriptor().getEmbeddingCode(insight, { language: "ts" });

        expect(code).toContain('m.localId("m_won")');
        expect(code).toMatch(
            /lineStyleMapping:\s*\[\s*\{\s*id: "m_won",\s*lineStyle: "dashed",\s*lineWidth: 1\s*\}\s*\]/,
        );
    });

    it("keeps attribute element ids of segment line styles in the generated code", () => {
        const insight = styledLineInsight([{ id: "Direct Sales", lineStyle: "dotted", lineWidth: 4 }]);

        const code = new LineChartDescriptor().getEmbeddingCode(insight, { language: "ts" });

        expect(code).toMatch(
            /lineStyleMapping:\s*\[\s*\{\s*id: "Direct Sales",\s*lineStyle: "dotted",\s*lineWidth: 4\s*\}\s*\]/,
        );
    });
});
