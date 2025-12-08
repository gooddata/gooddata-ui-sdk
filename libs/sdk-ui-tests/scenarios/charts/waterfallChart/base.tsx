// (C) 2023-2025 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { modifyMeasure } from "@gooddata/sdk-model";
import { IWaterfallChartProps, WaterfallChart } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const WaterfallChartWithSingleMeasureAndViewBy = {
    measures: [ReferenceMd.Amount],
    viewBy: ReferenceMd.Product.Name,
};

export const WaterfallChartWithMultiMeasures = {
    measures: [
        modifyMeasure(ReferenceMd.Velocity.Sum, (m) => m.alias("Sum Velocity").format("$#,##0")),
        modifyMeasure(ReferenceMd.Duration.Sum, (m) => m.alias("Sum Duration").format("$#,##0")),
        modifyMeasure(ReferenceMd.Density.Sum, (m) => m.alias("Sum Density").format("$#,##0")),
    ],
};

export const base = scenariosFor<IWaterfallChartProps>("WaterfallChart", WaterfallChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({
        screenshotSize: { width: 800, height: 600 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .addScenario("single measure", {
        measures: [ReferenceMd.Amount],
    })
    .addScenario("single measure with viewBy", WaterfallChartWithSingleMeasureAndViewBy)
    .addScenario("multi measures", WaterfallChartWithMultiMeasures)
    .addScenario("multi measures with a total measure", {
        ...WaterfallChartWithMultiMeasures,
        config: {
            total: {
                measures: [ReferenceMd.Density.Sum.measure.localIdentifier],
            },
        },
    });
