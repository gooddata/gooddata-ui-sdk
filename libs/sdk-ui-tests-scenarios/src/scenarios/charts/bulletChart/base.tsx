// (C) 2007-2026 GoodData Corporation

import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { newAttributeSort } from "@gooddata/sdk-model";
import { BulletChart, type IBulletChartProps } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const BulletChartWithAllMeasuresAndViewBy = {
    primaryMeasure: ReferenceMd.Won,
    targetMeasure: ReferenceMd.Amount,
    comparativeMeasure: ReferenceMdExt.CalculatedLost,
    viewBy: [ReferenceMd.Product.Name],
};

export const BulletChartWithAllMeasuresAndTwoViewBy = {
    primaryMeasure: ReferenceMd.Won,
    targetMeasure: ReferenceMd.Amount,
    comparativeMeasure: ReferenceMdExt.CalculatedLost,
    viewBy: [ReferenceMd.Product.Name, ReferenceMd.Region.Default],
};

export const BulletChartWithPrimaryMeasureAndTwoViewByDates = {
    primaryMeasure: ReferenceMd.Won,
    viewBy: [ReferenceMd.DateDatasets.Closed.ClosedYear.Default, ReferenceMdExt.ModifiedClosedYear],
};

export const BulletChartWithAllMeasuresMeasuresAndTwoViewByDates = {
    primaryMeasure: ReferenceMd.Won,
    targetMeasure: ReferenceMd.Amount,
    comparativeMeasure: ReferenceMdExt.CalculatedLost,
    viewBy: [ReferenceMd.DateDatasets.Closed.ClosedYear.Default, ReferenceMdExt.ModifiedClosedYear],
};

export const base = scenariosFor<IBulletChartProps>("BulletChart", BulletChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .addScenario("primary measure", {
        primaryMeasure: ReferenceMd.Won,
    })
    .addScenario("primary and target measures", {
        primaryMeasure: ReferenceMd.Won,
        targetMeasure: ReferenceMd.Amount,
    })
    .addScenario("primary and comparative measures", {
        primaryMeasure: ReferenceMd.Won,
        comparativeMeasure: ReferenceMd.Amount,
    })
    .addScenario("primary, target and comparative measures", {
        primaryMeasure: ReferenceMd.Won,
        targetMeasure: ReferenceMd.Amount,
        comparativeMeasure: ReferenceMdExt.CalculatedLost,
    })
    .addScenario("primary and target measures with viewBy", {
        primaryMeasure: ReferenceMd.Won,
        targetMeasure: ReferenceMd.Amount,
        viewBy: [ReferenceMd.Product.Name],
    })
    .addScenario("primary, target and comparative measures with viewBy", BulletChartWithAllMeasuresAndViewBy)
    .addScenario("primary, target and comparative measures with viewBy and sort", {
        ...BulletChartWithAllMeasuresAndViewBy,
        sortBy: [newAttributeSort(ReferenceMd.Product.Name)],
    })
    .addScenario(
        "primary, target and comparative measures with two viewBy",
        BulletChartWithAllMeasuresAndTwoViewBy,
    )
    .addScenario("primary with two viewBy dates", BulletChartWithPrimaryMeasureAndTwoViewByDates)
    .addScenario(
        "primary, target and comparative measures with two viewBy dates",
        BulletChartWithAllMeasuresMeasuresAndTwoViewByDates,
    );
