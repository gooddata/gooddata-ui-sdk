// (C) 2007-2019 GoodData Corporation
import { PieChart, IPieChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { legendCustomizer } from "../_infra/legendVariants";
import { PieChartWithSingleMeasureAndViewBy, PieChartWithTwoMeasures } from "./base";
import { chartAlignmentVariants } from "../_infra/chartAlignmentVariants";

const legendScenarios = scenariosFor<IPieChartProps>("PieChart", PieChart)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("two measures", PieChartWithTwoMeasures, legendCustomizer)
    .addScenarios("single measure and viewBy", PieChartWithSingleMeasureAndViewBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<IPieChartProps>("PieChart", PieChart)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("", PieChartWithSingleMeasureAndViewBy, dataLabelCustomizer);

const chartAlignmentScenarios = scenariosFor<IPieChartProps>("PieChart", PieChart)
    .withVisualTestConfig({ groupUnder: "alignment", screenshotSize: { width: 400, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("", PieChartWithSingleMeasureAndViewBy, chartAlignmentVariants);

export default [legendScenarios, dataLabelScenarios, chartAlignmentScenarios];
