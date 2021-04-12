// (C) 2007-2019 GoodData Corporation
import { BubbleChart, IBubbleChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { legendCustomizer } from "../_infra/legendVariants";
import { BubbleChartWithAllMeasuresAndAttribute } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { responsiveScenarios } from "../_infra/responsiveScenarios";
import { legendResponsiveVariants, legendResponsiveSizeVariants } from "../_infra/legendResponsiveVariants";

const legendScenarios = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", BubbleChartWithAllMeasuresAndAttribute, legendCustomizer);

const dataLabelScenarios = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", BubbleChartWithAllMeasuresAndAttribute, dataLabelCustomizer);

const legendResponziveScenarios = responsiveScenarios(
    "BubbleChart",
    ScenarioGroupNames.LegendResponsive,
    BubbleChart,
    BubbleChartWithAllMeasuresAndAttribute,
    legendResponsiveSizeVariants,
    false,
    legendResponsiveVariants,
);

export default [legendScenarios, dataLabelScenarios, ...legendResponziveScenarios];
