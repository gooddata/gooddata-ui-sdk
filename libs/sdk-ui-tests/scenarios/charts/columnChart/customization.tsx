// (C) 2007-2019 GoodData Corporation
import { ColumnChart, IColumnChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { legendCustomizer } from "../_infra/legendVariants";
import {
    ColumnChartWithTwoMeasuresAndViewBy,
    ColumnChartWithSingleMeasureAndViewByAndStackMultipleItems,
} from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { responsiveScenarios } from "../_infra/responsiveScenarios";
import { legendResponsiveVariants, legendResponsiveSizeVariants } from "../_infra/legendResponsiveVariants";
import { extendedDataLabelCustomizer } from "../_infra/extendedDataLabelVariants";

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
