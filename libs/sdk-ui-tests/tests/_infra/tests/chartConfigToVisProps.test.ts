// (C) 2020-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IChartConfig } from "@gooddata/sdk-ui-charts";

import { chartConfigToVisProperties } from "../chartConfigToVisProps.js";

describe("chartConfigToControls", () => {
    const Scenarios: Array<[string, IChartConfig]> = [
        ["convert xaxis alignment - low", { xaxis: { name: { position: "low" } } }],
        ["convert xaxis alignment - middle", { xaxis: { name: { position: "middle" } } }],
        ["convert xaxis alignment - high", { xaxis: { name: { position: "high" } } }],
        ["convert secondary xaxis alignment - low", { secondary_xaxis: { name: { position: "low" } } }],
        ["convert secondary xaxis alignment - middle", { secondary_xaxis: { name: { position: "middle" } } }],
        ["convert secondary xaxis alignment - high", { secondary_xaxis: { name: { position: "high" } } }],
        ["convert yaxis alignment - low", { yaxis: { name: { position: "low" } } }],
        ["convert yaxis alignment - middle", { yaxis: { name: { position: "middle" } } }],
        ["convert yaxis alignment - high", { yaxis: { name: { position: "high" } } }],
        ["convert secondary yaxis alignment - low", { secondary_yaxis: { name: { position: "low" } } }],
        ["convert secondary yaxis alignment - middle", { secondary_yaxis: { name: { position: "middle" } } }],
        ["convert secondary yaxis alignment - high", { secondary_yaxis: { name: { position: "high" } } }],
    ];

    it.each(Scenarios)("should %s", (_desc, input) => {
        expect(chartConfigToVisProperties(input)).toMatchSnapshot();
    });
});
