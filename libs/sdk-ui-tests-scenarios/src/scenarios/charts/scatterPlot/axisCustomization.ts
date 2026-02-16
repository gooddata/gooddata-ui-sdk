// (C) 2007-2026 GoodData Corporation

import { type IScatterPlotProps, ScatterPlot } from "@gooddata/sdk-ui-charts";

import { ScatterPlotWithMeasuresAndAttribute } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { axisNameCustomization } from "../_infra/axisNameCustomization.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const axisConfig = scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withVisualTestConfig({
        screenshotSize: { width: 800, height: 600 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("Y axis min/max configuration", {
        ...ScatterPlotWithMeasuresAndAttribute,
        config: {
            yaxis: {
                min: "0.5",
                max: "0.55",
            },
            xaxis: {
                min: "5000000",
                max: "15000000",
            },
        },
    });

const axisNameScenarios = scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({
        groupUnder: "axis name configuration",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .addScenarios("axis name configuration", ScatterPlotWithMeasuresAndAttribute, axisNameCustomization);

export const axisCustomization = [axisConfig, axisNameScenarios];
