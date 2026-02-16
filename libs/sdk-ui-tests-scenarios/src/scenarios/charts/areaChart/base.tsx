// (C) 2007-2026 GoodData Corporation

import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { newAttributeSort, newMeasureSort, newMeasureValueFilter } from "@gooddata/sdk-model";
import { AreaChart, type IAreaChartProps } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const AreaChartWithViewBy = {
    measures: [ReferenceMd.Amount],
    viewBy: [ReferenceMd.Product.Name],
};

export const AreaChartWithViewAndStackBy = {
    measures: [ReferenceMd.Amount],
    viewBy: [ReferenceMd.Product.Name],
    stackBy: ReferenceMd.Region.Default,
};

export const AreaChartWithTwoMeasuresAndViewBy = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    viewBy: [ReferenceMd.Product.Name],
};

export const AreaChartViewByDate = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    viewBy: [ReferenceMd.DateDatasets.Closed.ClosedYear.Default],
};

export const AreaChartWithManyDataPoints = {
    measures: [ReferenceMd.Amount],
    filters: [newMeasureValueFilter(ReferenceMd.Amount, "GREATER_THAN", 100000)],
    viewBy: ReferenceMd.Opportunity.Name,
};

export const AreaChartWithLotArithmeticMeasuresAndViewBy = {
    measures: [
        ReferenceMd.Amount,
        ReferenceMd.Won,
        ReferenceMd.Probability,
        ReferenceMd.WinRate,
        ReferenceMd.SnapshotEOP,
        ReferenceMd.TimelineEOP,
        ReferenceMdExt.CalculatedLost,
        ReferenceMdExt.CalculatedWonLostRatio,
    ],
    viewBy: ReferenceMd.DateDatasets.Created.CreatedQuarterYear.Default,
};

export const AreaChartWithViewByDateAndStackByDate = {
    measures: [ReferenceMd.Amount],
    viewBy: [ReferenceMd.DateDatasets.Closed.ClosedYear.Default],
    stackBy: ReferenceMd.DateDatasets.Created.CreatedYear.Default,
};

export const base = scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .addScenario("single measure", {
        measures: [ReferenceMd.Amount],
    })
    .addScenario("single measure with viewBy", AreaChartWithViewBy)
    .addScenario("single measure with viewBy and stackBy", AreaChartWithViewAndStackBy)
    .addScenario("single measure with two viewBy", {
        measures: [ReferenceMd.Amount],
        viewBy: [ReferenceMd.Product.Name, ReferenceMd.Region.Default],
    })
    .addScenario("two measures with viewBy", AreaChartWithTwoMeasuresAndViewBy)
    .addScenario("two measures with undefined values", AreaChartViewByDate)
    .addScenario("two measures with viewBy sorted by attribute", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        viewBy: [ReferenceMd.Product.Name],
        sortBy: [newAttributeSort(ReferenceMd.Product.Name, "desc")],
    })
    .addScenario("two measures with viewBy sorted by measure", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        viewBy: [ReferenceMd.Product.Name],
        sortBy: [newMeasureSort(ReferenceMd.Won, "asc")],
    })
    .addScenario("arithmetic measures", {
        measures: [
            ReferenceMd.Amount,
            ReferenceMd.Won,
            ReferenceMdExt.CalculatedLost,
            ReferenceMdExt.CalculatedWonLostRatio,
        ],
        viewBy: [ReferenceMd.Product.Name],
    })
    .addScenario(
        "with one measure and view by date and stack by date",
        AreaChartWithViewByDateAndStackByDate,
    );
