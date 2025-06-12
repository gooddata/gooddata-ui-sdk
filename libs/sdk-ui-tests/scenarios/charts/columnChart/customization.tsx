// (C) 2007-2019 GoodData Corporation
import { ColumnChart, IColumnChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import {
    ColumnChartWithTwoMeasuresAndViewBy,
    ColumnChartWithSingleMeasureAndViewByAndStackMultipleItems,
} from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";
import {
    legendResponsiveVariants,
    legendResponsiveSizeVariants,
} from "../_infra/legendResponsiveVariants.js";
import { extendedDataLabelCustomizer } from "../_infra/extendedDataLabelVariants.js";

const legendScenarios = scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", ColumnChartWithTwoMeasuresAndViewBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios(
        "data labels",
        ColumnChartWithSingleMeasureAndViewByAndStackMultipleItems,
        extendedDataLabelCustomizer,
    );

const legendResponziveScenarios = responsiveScenarios(
    "ColumnChart",
    ScenarioGroupNames.LegendResponsive,
    ColumnChart,
    ColumnChartWithSingleMeasureAndViewByAndStackMultipleItems,
    legendResponsiveSizeVariants,
    false,
    legendResponsiveVariants,
);

export default [legendScenarios, ...legendResponziveScenarios, dataLabelScenarios];
