// (C) 2007-2019 GoodData Corporation
import { PyramidChart, IPyramidChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import { PyramidChartWithMeasureAndViewBy, PyramidChartWithTwoMeasures } from "./base.js";
import { chartAlignmentVariants } from "../_infra/chartAlignmentVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";
import {
    legendResponsiveVariants,
    legendResponsiveSizeVariants,
} from "../_infra/legendResponsiveVariants.js";

const legendScenarios = scenariosFor<IPyramidChartProps>("PyramidChart", PyramidChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position - two measures", PyramidChartWithTwoMeasures, legendCustomizer)
    .addScenarios(
        "legend position - single measure and viewBy",
        PyramidChartWithMeasureAndViewBy,
        legendCustomizer,
    );

const dataLabelScenarios = scenariosFor<IPyramidChartProps>("PyramidChart", PyramidChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", PyramidChartWithMeasureAndViewBy, dataLabelCustomizer);

const chartAlignmentScenarios = scenariosFor<IPyramidChartProps>("PyramidChart", PyramidChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "alignment", screenshotSize: { width: 400, height: 600 } })
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

export default [legendScenarios, dataLabelScenarios, chartAlignmentScenarios, ...legendResponziveScenarios];
