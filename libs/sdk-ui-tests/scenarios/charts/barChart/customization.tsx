// (C) 2007-2025 GoodData Corporation

import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";

import {
    BarChartWithLargeLegend,
    BarChartWithSingleMeasureAndViewByAndStackMultipleItems,
    BarChartWithTwoMeasuresAndViewBy,
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

const legendScenarios = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "legend position",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", BarChartWithTwoMeasuresAndViewBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "data labels",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
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

export const customization = [legendScenarios, dataLabelScenarios, ...legendResponziveScenarios];
