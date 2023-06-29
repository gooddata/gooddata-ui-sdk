// (C) 2007-2019 GoodData Corporation
import { DonutChart, IDonutChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import { DonutChartWithSingleMeasureAndViewBy, DonutChartWithTwoMeasures } from "./base.js";
import { chartAlignmentVariants } from "../_infra/chartAlignmentVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";
import {
    legendResponsiveVariants,
    legendResponsiveSizeVariants,
} from "../_infra/legendResponsiveVariants.js";

const legendScenarios = scenariosFor<IDonutChartProps>("DonutChart", DonutChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position - two measures", DonutChartWithTwoMeasures, legendCustomizer)
    .addScenarios(
        "legend position - single measure and viewBy",
        DonutChartWithSingleMeasureAndViewBy,
        legendCustomizer,
    );

const dataLabelScenarios = scenariosFor<IDonutChartProps>("DonutChart", DonutChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", DonutChartWithSingleMeasureAndViewBy, dataLabelCustomizer);

const chartAlignmentScenarios = scenariosFor<IDonutChartProps>("DonutChart", DonutChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "alignment", screenshotSize: { width: 400, height: 600 } })
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

export default [legendScenarios, dataLabelScenarios, chartAlignmentScenarios, ...legendResponziveScenarios];
