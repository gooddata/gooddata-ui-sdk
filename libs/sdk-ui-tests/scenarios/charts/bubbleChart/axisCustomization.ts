// (C) 2007-2019 GoodData Corporation

import { BubbleChart, IBubbleChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { axisNameCustomization } from "../_infra/axisNameCustomization.js";
import { BubbleChartWithAllMeasuresAndAttribute } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const singleAxisNameConfig = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withVisualTestConfig({
        groupUnder: "axis name customization",
        screenshotSize: { width: 800, height: 600 },
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("axis name customization", BubbleChartWithAllMeasuresAndAttribute, axisNameCustomization);

/*
 * TODO: "long name of X and Y axes are truncated" story used to exist in old stories;
 *  shouldn't this be in all axis customizations stories for all charts?
 */
const axisConfig = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("X axis min/max configuration", {
        ...BubbleChartWithAllMeasuresAndAttribute,
        config: {
            xaxis: {
                min: "5000000",
                max: "25000000",
            },
        },
    })
    .addScenario("Y axis min/max configuration", {
        ...BubbleChartWithAllMeasuresAndAttribute,
        config: {
            yaxis: {
                min: ".54",
                max: ".70",
            },
        },
    })
    .addScenario("Y axis max only configuration", {
        ...BubbleChartWithAllMeasuresAndAttribute,
        config: {
            yaxis: {
                max: ".53",
            },
        },
    })
    .addScenario("X axis max only configuration", {
        ...BubbleChartWithAllMeasuresAndAttribute,
        config: {
            xaxis: {
                max: "15000000",
            },
        },
    })
    .addScenario("X and Y axis min/max configuration", {
        ...BubbleChartWithAllMeasuresAndAttribute,
        config: {
            xaxis: {
                min: "5000000",
                max: "25000000",
            },
            yaxis: {
                min: ".54",
                max: ".70",
            },
        },
    });

export default [axisConfig, singleAxisNameConfig];
