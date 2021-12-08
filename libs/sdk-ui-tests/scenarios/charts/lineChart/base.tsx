// (C) 2007-2019 GoodData Corporation
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { LineChart, ILineChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { newAttributeSort, newMeasureSort, newMeasureValueFilter } from "@gooddata/sdk-model";
import { ScenarioGroupNames } from "../_infra/groupNames";

export const LineChartTwoMeasuresWithTrendyBy = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    trendBy: ReferenceMd.CreatedQuarterYear,
};

export const LineChartWithArithmeticMeasuresAndViewBy = {
    measures: [
        ReferenceMd.Amount,
        ReferenceMd.Won,
        ReferenceMdExt.CalculatedLost,
        ReferenceMdExt.CalculatedWonLostRatio,
    ],
    trendBy: ReferenceMd.CreatedQuarterYear,
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
    trendBy: ReferenceMd.CreatedQuarterYear,
};

export const LineChartWithManyDataPoints = {
    measures: [ReferenceMd.Amount],
    filters: [newMeasureValueFilter(ReferenceMd.Amount, "GREATER_THAN", 100000)],
    trendBy: ReferenceMd.Opportunity.Name,
};

export const LineChartWithSegmentByDate = {
    measures: [ReferenceMd.Amount],
    segmentBy: ReferenceMd.CreatedYear,
};

export const LineChartWithTrendByDateAndSegmentByDate = {
    measures: [ReferenceMd.Amount],
    trendBy: ReferenceMd.CreatedYear,
    segmentBy: ReferenceMd.ClosedYear,
};

export default scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("single measure", {
        measures: [ReferenceMd.Amount],
    })
    .addScenario("single measure with trendBy", {
        measures: [ReferenceMd.Amount],
        trendBy: ReferenceMd.CreatedQuarterYear,
    })
    .addScenario("single measure with % and trendBy", {
        measures: [ReferenceMd.WinRate],
        trendBy: ReferenceMd.CreatedQuarterYear,
    })
    .addScenario("two measures with trendBy", LineChartTwoMeasuresWithTrendyBy)
    .addScenario("two measures with trendBy and sort by measure", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        trendBy: ReferenceMd.CreatedQuarterYear,
        sortBy: [newMeasureSort(ReferenceMd.Won, "asc")],
    })
    .addScenario("two measures with trendBy and sort by attribute", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        trendBy: ReferenceMd.CreatedQuarterYear,
        sortBy: [newAttributeSort(ReferenceMd.CreatedQuarterYear, "desc")],
    })
    .addScenario("single measure with trendBy and segmentBy", {
        measures: [ReferenceMd.Amount],
        trendBy: ReferenceMd.CreatedQuarterYear,
        segmentBy: ReferenceMd.Region,
    })
    .addScenario("arithmetic measures", LineChartWithArithmeticMeasuresAndViewBy)
    .addScenario("with one measure and segment by date", LineChartWithSegmentByDate)
    .addScenario(
        "with one measure and trend by date and segment by date",
        LineChartWithTrendByDateAndSegmentByDate,
    );
