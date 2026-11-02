// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";
import { type YAMLMap } from "yaml";

import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";

import { SCATTER_CHART_DEFAULTS, scatterChartLoad, scatterChartSave } from "./scatterChart.js";

describe("scatter chart config", () => {
    it("loads a hidden legend into legend_enabled", () => {
        const pair = scatterChartLoad({
            controls: { ...SCATTER_CHART_DEFAULTS, legend: { enabled: false, position: "bottom" } },
        });

        expect((pair?.value as YAMLMap | undefined)?.toJSON()?.legend_enabled).toBe(false);
        expect((pair?.value as YAMLMap | undefined)?.toJSON()?.legend_position).toBe("bottom");
    });

    it("saves legend_enabled and legend_position into legend", () => {
        const config = { legend_enabled: false, legend_position: "bottom" } as Visualisation["config"];

        expect(scatterChartSave(undefined, config)?.legend).toEqual({ enabled: false, position: "bottom" });
    });

    it("does not save a legend that has the default values", () => {
        const config = { legend_enabled: true, legend_position: "auto" } as Visualisation["config"];

        expect(scatterChartSave(undefined, config)?.legend).toBeUndefined();
    });
});
