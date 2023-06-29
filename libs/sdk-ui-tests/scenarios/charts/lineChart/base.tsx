// (C) 2007-2019 GoodData Corporation
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { LineChart, ILineChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { newAttributeSort, newMeasureSort, newMeasureValueFilter } from "@gooddata/sdk-model";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const LineChartTwoMeasuresWithTrendyBy = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    trendBy: ReferenceMd.DateDatasets.Created.QuarterYear.USShort,
};

export const LineChartWithArithmeticMeasuresAndViewBy = {
    measures: [
        ReferenceMd.Amount,
        ReferenceMd.Won,
        ReferenceMdExt.CalculatedLost,
        ReferenceMdExt.CalculatedWonLostRatio,
    ],
    trendBy: ReferenceMd.DateDatasets.Created.QuarterYear.USShort,
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
    trendBy: ReferenceMd.DateDatasets.Created.QuarterYear.USShort,
};

export const LineChartWithManyDataPoints = {
    measures: [ReferenceMd.Amount],
    filters: [newMeasureValueFilter(ReferenceMd.Amount, "GREATER_THAN", 100000)],
    trendBy: ReferenceMd.Opportunity.Name,
};

export const LineChartWithSegmentByDate = {
    measures: [ReferenceMd.Amount],
    segmentBy: ReferenceMd.DateDatasets.Created.Year.Default,
};

export const LineChartWithTrendByDateAndSegmentByDate = {
    measures: [ReferenceMd.Amount],
    trendBy: ReferenceMd.DateDatasets.Created.Year.Default,
    segmentBy: ReferenceMd.DateDatasets.Closed.Year.Default,
};

export const LineChartViewByDate = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    trendBy: ReferenceMd.DateDatasets.Closed.Year.Default,
};

export default scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("single measure", {
        measures: [ReferenceMd.Amount],
    })
    .addScenario("single measure with trendBy", {
        measures: [ReferenceMd.Amount],
        trendBy: ReferenceMd.DateDatasets.Created.QuarterYear.USShort,
    })
    .addScenario("single measure with % and trendBy", {
        measures: [ReferenceMd.WinRate],
        trendBy: ReferenceMd.DateDatasets.Created.QuarterYear.USShort,
    })
    .addScenario("two measures with trendBy", LineChartTwoMeasuresWithTrendyBy)
    .addScenario("two measures with trendBy and sort by measure", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        trendBy: ReferenceMd.DateDatasets.Created.QuarterYear.USShort,
        sortBy: [newMeasureSort(ReferenceMd.Won, "asc")],
    })
    .addScenario("two measures with trendBy and sort by attribute", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        trendBy: ReferenceMd.DateDatasets.Created.QuarterYear.USShort,
        sortBy: [newAttributeSort(ReferenceMd.DateDatasets.Created.QuarterYear.USShort, "desc")],
    })
    .addScenario("single measure with trendBy and segmentBy", {
        measures: [ReferenceMd.Amount],
        trendBy: ReferenceMd.DateDatasets.Created.QuarterYear.USShort,
        segmentBy: ReferenceMd.Region,
    })
    .addScenario("arithmetic measures", LineChartWithArithmeticMeasuresAndViewBy)
    .addScenario("with one measure and segment by date", LineChartWithSegmentByDate)
    .addScenario(
        "with one measure and trend by date and segment by date",
        LineChartWithTrendByDateAndSegmentByDate,
    )
    .addScenario("with two measures and null values", LineChartViewByDate);
