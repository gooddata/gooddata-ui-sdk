// (C) 2007-2019 GoodData Corporation
import { ExperimentalLdm } from "@gooddata/experimental-workspace";
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";

export const BarChartWithSingleMeasureAndViewBy = {
    measures: [ExperimentalLdm.Amount],
    viewBy: [ExperimentalLdm.Product.Name],
};

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames("experiments")
    .withDefaultWorkspaceType("experimental-workspace")
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .addScenario("with single measure and view by", BarChartWithSingleMeasureAndViewBy);
