// (C) 2007-2019 GoodData Corporation
import { LineChart, ILineChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { dataPointCustomizer } from "../_infra/dataPointVariants.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import {
    LineChartTwoMeasuresWithTrendyBy,
    LineChartWithArithmeticMeasuresAndViewBy,
    LineChartWithManyDataPoints,
    LineChartWithLotArithmeticMeasuresAndViewBy,
    LineChartViewByDate,
} from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";
import {
    legendResponsiveVariants,
    legendResponsiveSizeVariants,
} from "../_infra/legendResponsiveVariants.js";

const legendScenarios = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", LineChartTwoMeasuresWithTrendyBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", LineChartTwoMeasuresWithTrendyBy, dataLabelCustomizer);

const dataPointScenarios = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data points" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data points - sparse chart", LineChartWithArithmeticMeasuresAndViewBy, dataPointCustomizer)
    .addScenarios("data points - dense chart", LineChartWithManyDataPoints, dataPointCustomizer);

const legendResponziveScenarios = responsiveScenarios(
    "LineChart",
    ScenarioGroupNames.LegendResponsive,
    LineChart,
    LineChartWithLotArithmeticMeasuresAndViewBy,
    legendResponsiveSizeVariants,
    false,
    legendResponsiveVariants,
);

const continuousLineScenario = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("null values with continuous line", {
        ...LineChartViewByDate,
        config: { continuousLine: { enabled: true } },
    });

export default [
    legendScenarios,
    dataLabelScenarios,
    dataPointScenarios,
    continuousLineScenario,
    ...legendResponziveScenarios,
];
