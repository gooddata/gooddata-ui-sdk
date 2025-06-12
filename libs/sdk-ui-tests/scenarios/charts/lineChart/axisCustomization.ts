// (C) 2007-2019 GoodData Corporation

import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { measureLocalId } from "@gooddata/sdk-model";
import { ILineChartProps, LineChart } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { axisNameCustomization } from "../_infra/axisNameCustomization.js";
import { LineChartTwoMeasuresWithTrendyBy, LineChartWithArithmeticMeasuresAndViewBy } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const axisConfig = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("Y axis min/max configuration", {
        ...LineChartTwoMeasuresWithTrendyBy,
        config: {
            yaxis: {
                min: "5000000",
                max: "25000000",
            },
        },
    })
    .addScenario("Y axis on the right", {
        ...LineChartTwoMeasuresWithTrendyBy,
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceMd.Amount), measureLocalId(ReferenceMd.Won)],
            },
        },
    })
    .addScenario("dual axes with one right measure", {
        ...LineChartWithArithmeticMeasuresAndViewBy,
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceMdExt.CalculatedWonLostRatio)],
            },
        },
    });

const singleAxisNameScenarios = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "single axis name configuration" })
    .addScenarios("single axis name configuration", LineChartTwoMeasuresWithTrendyBy, axisNameCustomization);

const dualAxisNameScenarios = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withVisualTestConfig({ groupUnder: "dual axis name configuration" })
    .addScenarios(
        "dual axis name configuration",
        {
            ...LineChartTwoMeasuresWithTrendyBy,
            config: {
                secondary_yaxis: {
                    measures: [measureLocalId(ReferenceMd.Won)],
                },
            },
        },
        axisNameCustomization,
    );

export default [axisConfig, singleAxisNameScenarios, dualAxisNameScenarios];
