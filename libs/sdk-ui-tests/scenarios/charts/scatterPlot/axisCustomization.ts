// (C) 2007-2019 GoodData Corporation

import { IScatterPlotProps, ScatterPlot } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { axisNameCustomization } from "../_infra/axisNameCustomization.js";
import { ScatterPlotWithMeasuresAndAttribute } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const axisConfig = scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
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
    .withVisualTestConfig({ groupUnder: "axis name configuration" })
    .addScenarios("axis name configuration", ScatterPlotWithMeasuresAndAttribute, axisNameCustomization);

export default [axisConfig, axisNameScenarios];
