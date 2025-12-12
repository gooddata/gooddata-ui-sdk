// (C) 2007-2025 GoodData Corporation

import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { newAttributeSort, newMeasureSort, newMeasureValueFilter } from "@gooddata/sdk-model";
import { type ILineChartProps, LineChart } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const LineChartTwoMeasuresWithTrendyBy = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    trendBy: ReferenceMd.DateDatasets.Created.CreatedQuarterYear.Default,
};

export const LineChartWithArithmeticMeasuresAndViewBy = {
    measures: [
        ReferenceMd.Amount,
        ReferenceMd.Won,
        ReferenceMdExt.CalculatedLost,
        ReferenceMdExt.CalculatedWonLostRatio,
    ],
    trendBy: ReferenceMd.DateDatasets.Created.CreatedQuarterYear.Default,
};

export const LineChartWithLotArithmeticMeasuresAndViewBy = {
    measures: [
        ReferenceMd.Amount,
        ReferenceMd.Won,
        ReferenceMd.Probability,
        ReferenceMd.WinRate,
        ReferenceMd.SnapshotEOP,
        ReferenceMdExt.CalculatedLost,
        ReferenceMdExt.CalculatedWonLostRatio,
    ],
    trendBy: ReferenceMd.DateDatasets.Created.CreatedQuarterYear.Default,
};

export const LineChartWithManyDataPoints = {
    measures: [ReferenceMd.Amount],
    filters: [newMeasureValueFilter(ReferenceMd.Amount, "GREATER_THAN", 100000)],
    trendBy: ReferenceMd.Opportunity.Name,
};

export const LineChartWithSegmentByDate = {
    measures: [ReferenceMd.Amount],
    segmentBy: ReferenceMd.DateDatasets.Created.CreatedYear.Default,
};

export const LineChartWithTrendByDateAndSegmentByDate = {
    measures: [ReferenceMd.Amount],
    trendBy: ReferenceMd.DateDatasets.Created.CreatedYear.Default,
    segmentBy: ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
};

export const LineChartViewByDate = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    trendBy: ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
};

export const base = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .addScenario("single measure", {
        measures: [ReferenceMd.Amount],
    })
    .addScenario("single measure with trendBy", {
        measures: [ReferenceMd.Amount],
        trendBy: ReferenceMd.DateDatasets.Created.CreatedQuarterYear.Default,
    })
    .addScenario("single measure with % and trendBy", {
        measures: [ReferenceMd.WinRate],
        trendBy: ReferenceMd.DateDatasets.Created.CreatedQuarterYear.Default,
    })
    .addScenario("two measures with trendBy", LineChartTwoMeasuresWithTrendyBy)
    .addScenario("two measures with trendBy and sort by measure", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        trendBy: ReferenceMd.DateDatasets.Created.CreatedQuarterYear.Default,
        sortBy: [newMeasureSort(ReferenceMd.Won, "asc")],
    })
    .addScenario("two measures with trendBy and sort by attribute", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        trendBy: ReferenceMd.DateDatasets.Created.CreatedQuarterYear.Default,
        sortBy: [newAttributeSort(ReferenceMd.DateDatasets.Created.CreatedQuarterYear.Default, "desc")],
    })
    .addScenario("single measure with trendBy and segmentBy", {
        measures: [ReferenceMd.Amount],
        trendBy: ReferenceMd.DateDatasets.Created.CreatedQuarterYear.Default,
        segmentBy: ReferenceMd.Region.Default,
    })
    .addScenario("arithmetic measures", LineChartWithArithmeticMeasuresAndViewBy)
    .addScenario("with one measure and segment by date", LineChartWithSegmentByDate)
    .addScenario(
        "with one measure and trend by date and segment by date",
        LineChartWithTrendByDateAndSegmentByDate,
    )
    .addScenario("with two measures and null values", LineChartViewByDate);
