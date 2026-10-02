// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";
import { type YAMLMap } from "yaml";

import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";

import { AREA_CHART_DEFAULTS, areaChartLoad, areaChartSave } from "./areaChart.js";

describe("area chart config", () => {
    it("loads lineStyleMapping into line_style_mapping", () => {
        const pair = areaChartLoad({
            controls: {
                ...AREA_CHART_DEFAULTS,
                lineStyleMapping: [
                    { id: "m1", lineStyle: "dashed", lineWidth: 3 },
                    { id: "m2", lineWidth: 1 },
                ],
            },
        });

        expect((pair?.value as YAMLMap | undefined)?.toJSON()?.line_style_mapping).toEqual({
            m1: { style: "dashed", width: 3 },
            m2: { width: 1 },
        });
    });

    it("saves line_style_mapping into lineStyleMapping", () => {
        const config = {
            line_style_mapping: {
                m1: { style: "dotted", width: 2 },
                m2: { style: "solid" },
            },
        } as unknown as Visualisation["config"];

        expect(areaChartSave(undefined, config)?.lineStyleMapping).toEqual([
            { id: "m1", lineStyle: "dotted", lineWidth: 2 },
            { id: "m2", lineStyle: "solid", lineWidth: undefined },
        ]);
    });

    it("does not save lineStyleMapping when line_style_mapping is absent", () => {
        const config = { legend_enabled: false } as unknown as Visualisation["config"];

        expect(areaChartSave(undefined, config)?.lineStyleMapping).toBeUndefined();
    });
});
