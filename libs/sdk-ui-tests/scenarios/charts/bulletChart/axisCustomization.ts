// (C) 2007-2019 GoodData Corporation

import { BulletChart, IBulletChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { axisNameCustomization } from "../_infra/axisNameCustomization.js";
import { BulletChartWithAllMeasuresAndViewBy } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const singleAxisNameConfig = scenariosFor<IBulletChartProps>("BulletChart", BulletChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withVisualTestConfig({
        groupUnder: "axis name customization",
        screenshotSize: { width: 800, height: 600 },
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("axis name customization", BulletChartWithAllMeasuresAndViewBy, axisNameCustomization);

/*
 * TODO: "long name of X and Y axes are truncated" story used to exist in old stories;
 *  shouldn't this be in all axis customizations stories for all charts?
 */
const axisConfig = scenariosFor<IBulletChartProps>("BulletChart", BulletChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("X axis min/max configuration", {
        ...BulletChartWithAllMeasuresAndViewBy,
        config: {
            xaxis: {
                min: "5000000",
                max: "25000000",
            },
        },
    })
    .addScenario("X axis max only configuration", {
        ...BulletChartWithAllMeasuresAndViewBy,
        config: {
            xaxis: {
                max: "15000000",
            },
        },
    })
    .addScenario("X axis hidden", {
        ...BulletChartWithAllMeasuresAndViewBy,
        config: {
            xaxis: {
                visible: false,
            },
        },
    })
    .addScenario("Y axis hidden", {
        ...BulletChartWithAllMeasuresAndViewBy,
        config: {
            yaxis: {
                visible: false,
            },
        },
    })
    .addScenario("Y axis rotation", {
        ...BulletChartWithAllMeasuresAndViewBy,
        config: {
            yaxis: {
                rotation: "60",
            },
        },
    })
    .addScenario("X axis rotation", {
        ...BulletChartWithAllMeasuresAndViewBy,
        config: {
            xaxis: {
                rotation: "60",
            },
        },
    });

export default [axisConfig, singleAxisNameConfig];
