// (C) 2007-2019 GoodData Corporation

import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { measureLocalId } from "@gooddata/sdk-model";
import { ColumnChart, IColumnChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { axisNameCustomization } from "../_infra/axisNameCustomization.js";
import {
    ColumnChartWithArithmeticMeasuresAndViewBy,
    ColumnChartWithTwoMeasuresAndTwoViewBy,
    ColumnChartWithTwoMeasuresAndViewBy,
} from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const singleAxisNameConfig = scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withVisualTestConfig({
        groupUnder: "single axis name customization",
        screenshotSize: { width: 800, height: 600 },
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios(
        "single axis name customization",
        ColumnChartWithTwoMeasuresAndViewBy,
        axisNameCustomization,
    );

const dualAxisNameConfig = scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withVisualTestConfig({
        groupUnder: "dual axis name customization",
        screenshotSize: { width: 800, height: 600 },
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios(
        "dual axis name customization",
        {
            ...ColumnChartWithArithmeticMeasuresAndViewBy,
            config: {
                secondary_yaxis: {
                    measures: [measureLocalId(ReferenceMdExt.CalculatedWonLostRatio)],
                },
            },
        },
        axisNameCustomization,
    );

const axisConfig = scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("Y axis min/max configuration", {
        ...ColumnChartWithTwoMeasuresAndViewBy,
        config: {
            yaxis: {
                min: "5000000",
                max: "25000000",
            },
        },
    })
    .addScenario("Y axis on right", {
        ...ColumnChartWithTwoMeasuresAndViewBy,
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceMd.Amount), measureLocalId(ReferenceMd.Won)],
            },
        },
    })
    .addScenario("no gridline", {
        ...ColumnChartWithTwoMeasuresAndViewBy,
        config: {
            grid: {
                enabled: false,
            },
        },
    })
    .addScenario("dual axis with one right measure and three left", {
        ...ColumnChartWithArithmeticMeasuresAndViewBy,
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceMdExt.CalculatedWonLostRatio)],
            },
        },
    })
    .addScenario("dual axis with right axis labels rotated", {
        ...ColumnChartWithArithmeticMeasuresAndViewBy,
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceMdExt.CalculatedWonLostRatio)],
                rotation: "45",
            },
        },
    })
    .addScenario("dual axis with hidden right Y axis", {
        ...ColumnChartWithArithmeticMeasuresAndViewBy,
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceMdExt.CalculatedWonLostRatio)],
                visible: false,
            },
        },
    })
    .addScenario("dual axis with no labels on right Y axis", {
        ...ColumnChartWithArithmeticMeasuresAndViewBy,
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceMdExt.CalculatedWonLostRatio)],
                labelsEnabled: false,
            },
        },
    })
    .addScenario("dual axis when two viewBy attributes", {
        ...ColumnChartWithTwoMeasuresAndTwoViewBy,
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceMd.Won)],
            },
        },
    })
    .addScenario("X axis rotation", {
        ...ColumnChartWithTwoMeasuresAndTwoViewBy,
        config: {
            xaxis: {
                rotation: "45",
            },
        },
    })
    .addScenario("X axis invisible", {
        ...ColumnChartWithTwoMeasuresAndTwoViewBy,
        config: {
            xaxis: {
                visible: false,
            },
        },
    })
    .addScenario("X and Y axis invisible", {
        ...ColumnChartWithTwoMeasuresAndTwoViewBy,
        config: {
            xaxis: {
                visible: false,
            },
            yaxis: {
                visible: false,
            },
        },
    })
    .addScenario("Y axis on right with two viewBy attributes", {
        ...ColumnChartWithTwoMeasuresAndTwoViewBy,
        config: {
            secondary_yaxis: {
                measures: [measureLocalId(ReferenceMd.Amount), measureLocalId(ReferenceMd.Won)],
            },
        },
    });

export default [axisConfig, singleAxisNameConfig, dualAxisNameConfig];
