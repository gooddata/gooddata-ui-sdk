// (C) 2023 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { IWaterfallChartProps, WaterfallChart } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { modifyMeasure } from "@gooddata/sdk-model";

export const WaterfallChartWithSingleMeasureAndViewBy = {
    measures: [ReferenceMd.Amount],
    viewBy: ReferenceMd.StageName.Default,
};

export const WaterfallChartWithMultiMeasures = {
    measures: [
        modifyMeasure(ReferenceMd.Velocity.Sum, (m) => m.alias("Sum Velocity").format("$#,##0")),
        modifyMeasure(ReferenceMd.Values.Sum, (m) => m.alias("Sum Values").format("$#,##0")),
        modifyMeasure(ReferenceMd.NegativeSumProbability, (m) =>
            m.alias("Negative Sum Probability").format("$#,##0"),
        ),
        modifyMeasure(ReferenceMd.NegativeSumDuration, (m) =>
            m.alias("Negative Sum Duration").format("$#,##0"),
        ),
    ],
};

export const WaterfallChartWithMultiMeasuresAndTotalMetric = {
    measures: [
        modifyMeasure(ReferenceMd.Velocity.Sum, (m) => m.alias("Sum Velocity").format("$#,##0")),
        modifyMeasure(ReferenceMd.Values.Sum, (m) => m.alias("Sum Values").format("$#,##0")),
        modifyMeasure(ReferenceMd.IntermediateSumVelocityAndValue, (m) =>
            m.alias("Total of velocity and values").format("$#,##0"),
        ),
        modifyMeasure(ReferenceMd.NegativeSumProbability, (m) =>
            m.alias("Negative Sum Probability").format("$#,##0"),
        ),
        modifyMeasure(ReferenceMd.NegativeSumDuration, (m) =>
            m.alias("Negative Sum Duration").format("$#,##0"),
        ),
        modifyMeasure(ReferenceMd.TotalSum, (m) => m.alias("Total balance").format("$#,##0")),
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
                measures: ["m_ab8s8km1dcwm", "m_aaKtfN0bAQyc"],
            },
        },
    });
