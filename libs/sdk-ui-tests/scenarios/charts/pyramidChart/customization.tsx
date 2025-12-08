// (C) 2007-2025 GoodData Corporation

import { IPyramidChartProps, PyramidChart } from "@gooddata/sdk-ui-charts";

import { PyramidChartWithMeasureAndViewBy, PyramidChartWithTwoMeasures } from "./base.js";
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

const legendScenarios = scenariosFor<IPyramidChartProps>("PyramidChart", PyramidChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "legend position",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position - two measures", PyramidChartWithTwoMeasures, legendCustomizer)
    .addScenarios(
        "legend position - single measure and viewBy",
        PyramidChartWithMeasureAndViewBy,
        legendCustomizer,
    );

const dataLabelScenarios = scenariosFor<IPyramidChartProps>("PyramidChart", PyramidChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "data labels",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", PyramidChartWithMeasureAndViewBy, dataLabelCustomizer);

const chartAlignmentScenarios = scenariosFor<IPyramidChartProps>("PyramidChart", PyramidChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "alignment",
        screenshotSize: { width: 400, height: 600 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("vertical alignment", PyramidChartWithMeasureAndViewBy, chartAlignmentVariants);

const legendResponziveScenarios = responsiveScenarios(
    "PyramidChart",
    ScenarioGroupNames.LegendResponsive,
    PyramidChart,
    PyramidChartWithMeasureAndViewBy,
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
