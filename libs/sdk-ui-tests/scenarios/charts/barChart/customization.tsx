// (C) 2007-2019 GoodData Corporation
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import {
    BarChartWithTwoMeasuresAndViewBy,
    BarChartWithLargeLegend,
    BarChartWithSingleMeasureAndViewByAndStackMultipleItems,
} from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";
import {
    legendResponsiveVariants,
    legendResponsiveSizeVariants,
} from "../_infra/legendResponsiveVariants.js";
import { extendedDataLabelCustomizer } from "../_infra/extendedDataLabelVariants.js";

const legendScenarios = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", BarChartWithTwoMeasuresAndViewBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios(
        "data labels",
        {
            ...BarChartWithSingleMeasureAndViewByAndStackMultipleItems,
            config: { enableSeparateTotalLabels: true },
        },
        extendedDataLabelCustomizer,
    );

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
