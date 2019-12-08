// (C) 2007-2019 GoodData Corporation
import { DonutChart, IDonutChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { legendCustomizer } from "../_infra/legendVariants";
import { DonutChartWithSingleMeasureAndViewBy, DonutChartWithTwoMeasures } from "./base";
import { chartAlignmentVariants } from "../_infra/chartAlignmentVariants";

const legendScenarios = scenariosFor<IDonutChartProps>("DonutChart", DonutChart)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("two measures", DonutChartWithTwoMeasures, legendCustomizer)
    .addScenarios("single measure and viewBy", DonutChartWithSingleMeasureAndViewBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<IDonutChartProps>("DonutChart", DonutChart)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("", DonutChartWithSingleMeasureAndViewBy, dataLabelCustomizer);

const chartAlignmentScenarios = scenariosFor<IDonutChartProps>("DonutChart", DonutChart)
    .withVisualTestConfig({ groupUnder: "alignment", screenshotSize: { width: 400, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("", DonutChartWithSingleMeasureAndViewBy, chartAlignmentVariants);

export default [legendScenarios, dataLabelScenarios, chartAlignmentScenarios];
