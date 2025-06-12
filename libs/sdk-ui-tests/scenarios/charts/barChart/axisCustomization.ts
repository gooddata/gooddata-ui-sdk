// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../../src/index.js";
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { axisNameCustomization } from "../_infra/axisNameCustomization.js";
import {
    BarChartWithArithmeticMeasuresAndViewBy,
    BarChartWithTwoMeasuresAndTwoViewBy,
    BarChartWithTwoMeasuresAndViewBy,
} from "./base.js";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { axisRotationVariants } from "../_infra/axisRotationVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const singleAxisNameConfig = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withVisualTestConfig({
        groupUnder: "single axis name customization",
        screenshotSize: { width: 800, height: 600 },
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("single axis name customization", BarChartWithTwoMeasuresAndViewBy, axisNameCustomization);

const dualAxisNameConfig = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withVisualTestConfig({
        groupUnder: "dual axis name customization",
        screenshotSize: { width: 800, height: 600 },
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios(
        "dual axis name customization",
        {
            ...BarChartWithTwoMeasuresAndTwoViewBy,
            config: {
                secondary_xaxis: {
                    measures: [measureLocalId(ReferenceMd.Won)],
                },
            },
        },
        axisNameCustomization,
    );

const dualAxisLabelRotation = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withVisualTestConfig({
        groupUnder: "dual axis label rotation",
        screenshotSize: { width: 800, height: 600 },
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios(
        "dual axis label rotation",
        {
            ...BarChartWithArithmeticMeasuresAndViewBy,
            config: {
                xaxis: {
                    rotation: "90",
                },
                secondary_xaxis: {
                    measures: [measureLocalId(ReferenceMdExt.CalculatedWonLostRatio)],
                    rotation: "90",
                },
            },
        },
        axisRotationVariants,
    );

const axisConfig = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("X axis min/max configuration", {
        ...BarChartWithTwoMeasuresAndViewBy,
        config: {
            xaxis: {
                min: "5000000",
                max: "25000000",
            },
        },
    })
    .addScenario("X axis on top", {
        ...BarChartWithTwoMeasuresAndViewBy,
        config: {
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceMd.Amount), measureLocalId(ReferenceMd.Won)],
            },
        },
    })
    .addScenario("dual axis with one top measure and three bottom", {
        ...BarChartWithArithmeticMeasuresAndViewBy,
        config: {
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceMdExt.CalculatedWonLostRatio)],
            },
        },
    })
    .addScenario("dual axis when two viewBy attributes", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        config: {
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceMd.Won)],
            },
        },
    })
    .addScenario("Y axis rotation", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        config: {
            yaxis: {
                rotation: "45",
            },
        },
    })
    .addScenario("Y axis invisible", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        config: {
            yaxis: {
                visible: false,
            },
        },
    })
    .addScenario("X axis on top with two viewBy attributes", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        config: {
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceMd.Amount), measureLocalId(ReferenceMd.Won)],
            },
        },
    });

export default [axisConfig, singleAxisNameConfig, dualAxisNameConfig, dualAxisLabelRotation];
