// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";
import { type YAMLMap } from "yaml";

import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";

import { LINE_CHART_DEFAULTS, lineChartLoad, lineChartSave } from "./lineChart.js";

describe("line chart config", () => {
    it("loads segment lineStyleMapping keyed by attribute element value into line_style_mapping", () => {
        const pair = lineChartLoad({
            controls: {
                ...LINE_CHART_DEFAULTS,
                lineStyleMapping: [
                    { id: "Direct Sales", lineStyle: "dashed", lineWidth: 1 },
                    { id: "Inside Sales", lineWidth: 4 },
                ],
            },
        });

        expect((pair?.value as YAMLMap | undefined)?.toJSON()?.line_style_mapping).toEqual({
            "Direct Sales": { style: "dashed", width: 1 },
            "Inside Sales": { width: 4 },
        });
    });

    it("saves segment line_style_mapping keyed by attribute element value into lineStyleMapping", () => {
        const config = {
            line_style_mapping: {
                "Direct Sales": { style: "dotted", width: 2 },
            },
        } as unknown as Visualisation["config"];

        expect(lineChartSave(undefined, config)?.lineStyleMapping).toEqual([
            { id: "Direct Sales", lineStyle: "dotted", lineWidth: 2 },
        ]);
    });
});
