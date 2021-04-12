// (C) 2007-2019 GoodData Corporation
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { legendCustomizer } from "../_infra/legendVariants";
import { BarChartWithTwoMeasuresAndViewBy, BarChartWithLargeLegend } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { responsiveScenarios } from "../_infra/responsiveScenarios";
import { legendResponsiveVariants, legendResponsiveSizeVariants } from "../_infra/legendResponsiveVariants";

const legendScenarios = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", BarChartWithTwoMeasuresAndViewBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", BarChartWithTwoMeasuresAndViewBy, dataLabelCustomizer);

const legendResponziveScenarios = responsiveScenarios(
    "BarChart",
    ScenarioGroupNames.LegendResponsive,
    BarChart,
    BarChartWithLargeLegend,
    legendResponsiveSizeVariants,
    false,
    legendResponsiveVariants,
);

export default [legendScenarios, dataLabelScenarios, ...legendResponziveScenarios];
