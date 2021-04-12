// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { newAttributeSort, newMeasureSort, newMeasureValueFilter } from "@gooddata/sdk-model";
import { AreaChart, IAreaChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";

export const AreaChartWithViewBy = {
    measures: [ReferenceLdm.Amount],
    viewBy: [ReferenceLdm.Product.Name],
};

export const AreaChartWithViewAndStackBy = {
    measures: [ReferenceLdm.Amount],
    viewBy: [ReferenceLdm.Product.Name],
    stackBy: ReferenceLdm.Region,
};

export const AreaChartWithTwoMeasuresAndViewBy = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    viewBy: [ReferenceLdm.Product.Name],
};

export const AreaChartViewByDate = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    viewBy: [ReferenceLdm.ClosedYear],
};

export const AreaChartWithManyDataPoints = {
    measures: [ReferenceLdm.Amount],
    filters: [newMeasureValueFilter(ReferenceLdm.Amount, "GREATER_THAN", 100000)],
    viewBy: ReferenceLdm.Opportunity.Name,
};

export const AreaChartWithLotArithmeticMeasuresAndViewBy = {
    measures: [
        ReferenceLdm.Amount,
        ReferenceLdm.Won,
        ReferenceLdm.Probability,
        ReferenceLdm.WinRate,
        ReferenceLdm.SnapshotEOP,
        ReferenceLdm.TimelineEOP,
        ReferenceLdmExt.CalculatedLost,
        ReferenceLdmExt.CalculatedWonLostRatio,
    ],
    viewBy: ReferenceLdm.CreatedQuarterYear,
};

export default scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("single measure", {
        measures: [ReferenceLdm.Amount],
    })
    .addScenario("single measure with viewBy", AreaChartWithViewBy)
    .addScenario("single measure with viewBy and stackBy", AreaChartWithViewAndStackBy)
    .addScenario("single measure with two viewBy", {
        measures: [ReferenceLdm.Amount],
        viewBy: [ReferenceLdm.Product.Name, ReferenceLdm.Region],
    })
    .addScenario("two measures with viewBy", AreaChartWithTwoMeasuresAndViewBy)
    .addScenario("two measures with undefined values", AreaChartViewByDate)
    .addScenario("two measures with viewBy sorted by attribute", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
        viewBy: [ReferenceLdm.Product.Name],
        sortBy: [newAttributeSort(ReferenceLdm.Product.Name, "desc")],
    })
    .addScenario("two measures with viewBy sorted by measure", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
        viewBy: [ReferenceLdm.Product.Name],
        sortBy: [newMeasureSort(ReferenceLdm.Won, "asc")],
    })
    .addScenario("arithmetic measures", {
        measures: [
            ReferenceLdm.Amount,
            ReferenceLdm.Won,
            ReferenceLdmExt.CalculatedLost,
            ReferenceLdmExt.CalculatedWonLostRatio,
        ],
        viewBy: [ReferenceLdm.Product.Name],
    });
