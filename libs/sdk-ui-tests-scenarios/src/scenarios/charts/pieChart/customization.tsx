// (C) 2007-2026 GoodData Corporation

import { type IPieChartProps, PieChart } from "@gooddata/sdk-ui-charts";

import { PieChartWithSingleMeasureAndViewBy, PieChartWithTwoMeasures } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { chartAlignmentVariants } from "../_infra/chartAlignmentVariants.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import {
    legendResponsiveSizeVariants,
    legendResponsiveVariants,
} from "../_infra/legendResponsiveVariants.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";

const legendScenarios = scenariosFor<IPieChartProps>("PieChart", PieChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "legend position",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position - two measures", PieChartWithTwoMeasures, legendCustomizer)
    .addScenarios(
        "legend position - single measure and viewBy",
        PieChartWithSingleMeasureAndViewBy,
        legendCustomizer,
    );

const dataLabelScenarios = scenariosFor<IPieChartProps>("PieChart", PieChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "data labels",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", PieChartWithSingleMeasureAndViewBy, dataLabelCustomizer);

const chartAlignmentScenarios = scenariosFor<IPieChartProps>("PieChart", PieChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "alignment",
        screenshotSize: { width: 400, height: 600 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("vertical alignment", PieChartWithSingleMeasureAndViewBy, chartAlignmentVariants);

const legendResponziveScenarios = responsiveScenarios(
    "PieChart",
    ScenarioGroupNames.LegendResponsive,
    PieChart,
    PieChartWithSingleMeasureAndViewBy,
    legendResponsiveSizeVariants,
    false,
    legendResponsiveVariants,
);

export const customization = [
    legendScenarios,
    dataLabelScenarios,
    chartAlignmentScenarios,
    ...legendResponziveScenarios,
];
