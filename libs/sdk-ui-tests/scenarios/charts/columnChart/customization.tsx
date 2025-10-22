// (C) 2007-2025 GoodData Corporation

import { ColumnChart, IColumnChartProps } from "@gooddata/sdk-ui-charts";

import {
    ColumnChartWithSingleMeasureAndViewByAndStackMultipleItems,
    ColumnChartWithTwoMeasuresAndViewBy,
} from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { extendedDataLabelCustomizer } from "../_infra/extendedDataLabelVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import {
    legendResponsiveSizeVariants,
    legendResponsiveVariants,
} from "../_infra/legendResponsiveVariants.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";

const legendScenarios = scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "legend position",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", ColumnChartWithTwoMeasuresAndViewBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "data labels",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
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
