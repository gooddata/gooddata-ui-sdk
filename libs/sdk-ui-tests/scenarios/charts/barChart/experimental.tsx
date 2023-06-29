// (C) 2007-2019 GoodData Corporation
import { ExperimentalMd } from "@gooddata/experimental-workspace";
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { newRankingFilter, newMeasureValueFilter } from "@gooddata/sdk-model";

const BarChartWithSingleMeasureAndViewBy = {
    measures: [ExperimentalMd.Amount],
    viewBy: [ExperimentalMd.Product.Name],
};

const BarChartWithRankingFilter = {
    measures: [ExperimentalMd.Amount],
    viewBy: [ExperimentalMd.Product.Default],
    filters: [newRankingFilter(ExperimentalMd.Amount, "TOP", 3)],
};

const BarChartWithMeasureValueFilter = {
    measures: [ExperimentalMd.Amount],
    viewBy: [ExperimentalMd.Product.Default],
    filters: [newMeasureValueFilter(ExperimentalMd.Amount, "GREATER_THAN", 500)],
};

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames("experiments")
    .withDefaultWorkspaceType("experimental-workspace")
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTestTypes("api") // << only api-level tests; no stories or visual regression
    .addScenario("with single measure and view by", BarChartWithSingleMeasureAndViewBy)
    .addScenario("with measure value filter", BarChartWithMeasureValueFilter)
    .addScenario("with ranking filter", BarChartWithRankingFilter);
