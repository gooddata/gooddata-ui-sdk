// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { LineChart, ILineChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { newAttributeSort, newMeasureSort, newMeasureValueFilter } from "@gooddata/sdk-model";
import { ScenarioGroupNames } from "../_infra/groupNames";

export const LineChartTwoMeasuresWithTrendyBy = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    trendBy: ReferenceLdm.CreatedQuarterYear,
};

export const LineChartWithArithmeticMeasuresAndViewBy = {
    measures: [
        ReferenceLdm.Amount,
        ReferenceLdm.Won,
        ReferenceLdmExt.CalculatedLost,
        ReferenceLdmExt.CalculatedWonLostRatio,
    ],
    trendBy: ReferenceLdm.CreatedQuarterYear,
};

export const LineChartWithLotArithmeticMeasuresAndViewBy = {
    measures: [
        ReferenceLdm.Amount,
        ReferenceLdm.Won,
        ReferenceLdm.Probability,
        ReferenceLdm.WinRate,
        ReferenceLdm.SnapshotEOP,
        ReferenceLdmExt.CalculatedLost,
        ReferenceLdmExt.CalculatedWonLostRatio,
    ],
    trendBy: ReferenceLdm.CreatedQuarterYear,
};

export const LineChartWithManyDataPoints = {
    measures: [ReferenceLdm.Amount],
    filters: [newMeasureValueFilter(ReferenceLdm.Amount, "GREATER_THAN", 100000)],
    trendBy: ReferenceLdm.Opportunity.Name,
};

export default scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("single measure", {
        measures: [ReferenceLdm.Amount],
    })
    .addScenario("single measure with trendBy", {
        measures: [ReferenceLdm.Amount],
        trendBy: ReferenceLdm.CreatedQuarterYear,
    })
    .addScenario("single measure with % and trendBy", {
        measures: [ReferenceLdm.WinRate],
        trendBy: ReferenceLdm.CreatedQuarterYear,
    })
    .addScenario("two measures with trendBy", LineChartTwoMeasuresWithTrendyBy)
    .addScenario("two measures with trendBy and sort by measure", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
        trendBy: ReferenceLdm.CreatedQuarterYear,
        sortBy: [newMeasureSort(ReferenceLdm.Won, "asc")],
    })
    .addScenario("two measures with trendBy and sort by attribute", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
        trendBy: ReferenceLdm.CreatedQuarterYear,
        sortBy: [newAttributeSort(ReferenceLdm.CreatedQuarterYear, "desc")],
    })
    .addScenario("single measure with trendBy and segmentBy", {
        measures: [ReferenceLdm.Amount],
        trendBy: ReferenceLdm.CreatedQuarterYear,
        segmentBy: ReferenceLdm.Region,
    })
    .addScenario("arithmetic measures", LineChartWithArithmeticMeasuresAndViewBy);
