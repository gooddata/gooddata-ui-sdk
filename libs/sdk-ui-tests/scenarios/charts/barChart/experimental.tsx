// (C) 2007-2019 GoodData Corporation
import { ExperimentalLdm } from "@gooddata/experimental-workspace";
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { newRankingFilter, newMeasureValueFilter } from "@gooddata/sdk-model";

const BarChartWithSingleMeasureAndViewBy = {
    measures: [ExperimentalLdm.Amount],
    viewBy: [ExperimentalLdm.Product.Name],
};

const BarChartWithRankingFilter = {
    measures: [ExperimentalLdm.Amount],
    viewBy: [ExperimentalLdm.Product.Default],
    filters: [newRankingFilter(ExperimentalLdm.Amount, "TOP", 3)],
};

const BarChartWithMeasureValueFilter = {
    measures: [ExperimentalLdm.Amount],
    viewBy: [ExperimentalLdm.Product.Default],
    filters: [newMeasureValueFilter(ExperimentalLdm.Amount, "GREATER_THAN", 500)],
};

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames("experiments")
    .withDefaultWorkspaceType("experimental-workspace")
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTestTypes("api") // << only api-level tests; no stories or visual regression
    .addScenario("with single measure and view by", BarChartWithSingleMeasureAndViewBy)
    .addScenario("with measure value filter", BarChartWithMeasureValueFilter)
    .addScenario("with ranking filter", BarChartWithRankingFilter);
