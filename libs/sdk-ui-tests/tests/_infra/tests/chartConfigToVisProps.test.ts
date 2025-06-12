// (C) 2020 GoodData Corporation
import { chartConfigToVisProperties } from "../chartConfigToVisProps.js";
import { IChartConfig } from "@gooddata/sdk-ui-charts";
import { describe, it, expect } from "vitest";

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
