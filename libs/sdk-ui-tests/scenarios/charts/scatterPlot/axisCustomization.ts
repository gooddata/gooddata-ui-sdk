// (C) 2007-2019 GoodData Corporation

import { IScatterPlotProps, ScatterPlot } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { axisNameCustomization } from "../_infra/axisNameCustomization";
import { ScatterPlotWithMeasuresAndAttribute } from "./base";

const axisConfig = scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
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
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "axis name configuration" })
    .addScenarios("", ScatterPlotWithMeasuresAndAttribute, axisNameCustomization);

export default [axisConfig, axisNameScenarios];
