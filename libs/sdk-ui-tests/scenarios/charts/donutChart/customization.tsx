// (C) 2007-2025 GoodData Corporation

import { DonutChart, IDonutChartProps } from "@gooddata/sdk-ui-charts";

import { DonutChartWithSingleMeasureAndViewBy, DonutChartWithTwoMeasures } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { chartAlignmentVariants } from "../_infra/chartAlignmentVariants.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import {
    legendResponsiveSizeVariants,
    legendResponsiveVariants,
} from "../_infra/legendResponsiveVariants.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";

const legendScenarios = scenariosFor<IDonutChartProps>("DonutChart", DonutChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "legend position",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position - two measures", DonutChartWithTwoMeasures, legendCustomizer)
    .addScenarios(
        "legend position - single measure and viewBy",
        DonutChartWithSingleMeasureAndViewBy,
        legendCustomizer,
    );

const dataLabelScenarios = scenariosFor<IDonutChartProps>("DonutChart", DonutChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "data labels",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", DonutChartWithSingleMeasureAndViewBy, dataLabelCustomizer);

const chartAlignmentScenarios = scenariosFor<IDonutChartProps>("DonutChart", DonutChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "alignment",
        screenshotSize: { width: 400, height: 600 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("vertical alignment", DonutChartWithSingleMeasureAndViewBy, chartAlignmentVariants);

const legendResponziveScenarios = responsiveScenarios(
    "DonutChart",
    ScenarioGroupNames.LegendResponsive,
    DonutChart,
    DonutChartWithSingleMeasureAndViewBy,
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
