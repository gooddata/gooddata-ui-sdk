// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { newInsightDefinition } from "@gooddata/sdk-model";

import { chartConfigFromInsight } from "../chartCodeGenUtils.js";
import { ColumnChartDescriptor } from "../columnChart/ColumnChartDescriptor.js";

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
});
