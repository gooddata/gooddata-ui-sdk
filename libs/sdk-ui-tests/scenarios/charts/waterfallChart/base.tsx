// (C) 2023 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { IWaterfallChartProps, WaterfallChart } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";

export const WaterfallChartWithSingleMeasureAndViewBy = {
    measures: [ReferenceMd.Amount],
    viewBy: ReferenceMd.StageName.Default,
};

export const WaterfallChartWithMultiMeasures = {
    measures: [
        ReferenceMd.Amount_1.Sum,
        ReferenceMd.Duration.Sum,
        ReferenceMd.Velocity.Sum,
        ReferenceMd.Probability_1.Sum,
    ],
};

export default scenariosFor<IWaterfallChartProps>("WaterfallChart", WaterfallChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .addScenario("single measure", {
        measures: [ReferenceMd.Amount],
    })
    .addScenario("single measure with viewBy", WaterfallChartWithSingleMeasureAndViewBy)
    .addScenario("multi measures", WaterfallChartWithMultiMeasures);
