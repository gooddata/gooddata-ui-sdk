// (C) 2023 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { IWaterfallChartProps, WaterfallChart } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { modifyMeasure } from "@gooddata/sdk-model";

export const WaterfallChartWithSingleMeasureAndViewBy = {
    measures: [ReferenceMd.Amount],
    viewBy: ReferenceMd.StageName.Default,
};

export const WaterfallChartWithMultiMeasures = {
    measures: [
        modifyMeasure(ReferenceMd.Amount_1.Sum, (m) => m.alias("Sum Amount").format("$#,##0")),
        modifyMeasure(ReferenceMd.Duration.Sum, (m) => m.alias("Sum Duration").format("$#,##0")),
        modifyMeasure(ReferenceMd.Velocity.Sum, (m) => m.alias("Sum Velocity").format("$#,##0")),
        modifyMeasure(ReferenceMd.Probability_1.Sum, (m) => m.alias("Sum Velocity").format("$#,##0")),
    ],
};

export const WaterfallChartWithMultiMeasuresAndTotalMetric = {
    measures: [
        modifyMeasure(ReferenceMd.Amount_1.Sum, (m) => m.alias("Total Balance").format("$#,##0")),
        modifyMeasure(ReferenceMd.Duration.Sum, (m) => m.alias("Sum Duration").format("$#,##0")),
        modifyMeasure(ReferenceMd.Velocity.Sum, (m) => m.alias("Sum Velocity").format("$#,##0")),
        modifyMeasure(ReferenceMd.Probability_1.Sum, (m) => m.alias("Sum Velocity").format("$#,##0")),
    ],
};

export default scenariosFor<IWaterfallChartProps>("WaterfallChart", WaterfallChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .addScenario("single measure", {
        measures: [ReferenceMd.Amount],
    })
    .addScenario("single measure with viewBy", WaterfallChartWithSingleMeasureAndViewBy)
    .addScenario("multi measures", WaterfallChartWithMultiMeasures)
    .addScenario("multi measures with a total measure", {
        ...WaterfallChartWithMultiMeasuresAndTotalMetric,
        config: {
            total: {
                measures: ["m_fact.opportunitysnapshot.amount_sum"]
            }
        }
    });
