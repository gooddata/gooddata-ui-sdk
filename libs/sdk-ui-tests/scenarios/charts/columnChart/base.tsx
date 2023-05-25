// (C) 2007-2019 GoodData Corporation
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { ColumnChart, IColumnChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import {
    newAttributeSort,
    newMeasureSort,
    newMeasureValueFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const ColumnChartWithSingleMeasureAndViewBy = {
    measures: [ReferenceMd.Amount],
    viewBy: [ReferenceMd.Product.Name],
};

export const ColumnChartWithSingleMeasureViewByAndStackBy = {
    measures: [ReferenceMd.Amount],
    viewBy: [ReferenceMd.Product.Name],
    stackBy: ReferenceMd.Region,
};

export const ColumnChartWithTwoMeasuresAndViewBy = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    viewBy: [ReferenceMd.Product.Name],
};

export const ColumnChartWithTwoMeasuresAndTwoViewBy = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    viewBy: [ReferenceMd.Product.Name, ReferenceMd.Region],
};

export const ColumnChartWithSingleMeasureAndViewByAndStackMultipleItems = {
    measures: [ReferenceMd.Amount],
    viewBy: [ReferenceMd.Region],
    stackBy: ReferenceMd.Product.Name,
};

export const ColumnChartWithSingleMeasureAndTwoViewByAndStack = {
    measures: [ReferenceMd.Amount],
    viewBy: [ReferenceMd.Product.Name, ReferenceMd.Region],
    stackBy: ReferenceMd.Department,
};

export const ColumnChartWithArithmeticMeasuresAndViewBy = {
    measures: [
        ReferenceMd.Amount,
        ReferenceMd.Won,
        ReferenceMdExt.CalculatedLost,
        ReferenceMdExt.CalculatedWonLostRatio,
    ],
    viewBy: [ReferenceMd.Product.Name],
};

export const ColumnChartViewByDateAndPop = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won, ReferenceMdExt.WonPopClosedYear],
    viewBy: [ReferenceMd.DateDatasets.Closed.Year.Default],
};

export const ColumnChartViewByTwoDates = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won, ReferenceMdExt.WonPopClosedYear],
    viewBy: [ReferenceMd.DateDatasets.Closed.Year.Default, ReferenceMdExt.ModifiedClosedYear],
};

export const ColumnChartStackByDate = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won, ReferenceMdExt.WonPopClosedYear],
    stackBy: ReferenceMd.DateDatasets.Closed.Year.Default,
};

/*
 * TODO: - column chart used to have test for attribute with alias() - do we want to test this?
 *  - colum chart used to have test with small height - perhaps should add set of special stories to test this for
 *  all charts?
 */
export default scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .addScenario("single measure", {
        measures: [ReferenceMd.Amount],
    })
    .addScenario("single measure with viewBy", ColumnChartWithSingleMeasureAndViewBy)
    .addScenario("single ratio measure with viewBy", {
        measures: [ReferenceMdExt.AmountWithRatio],
        viewBy: [ReferenceMd.Product.Name],
    })
    .addScenario("single measure with viewBy and stackBy", ColumnChartWithSingleMeasureViewByAndStackBy)
    .addScenario("single measure with viewBy and stackBy filtered to single stack", {
        measures: [ReferenceMd.Amount],
        viewBy: [ReferenceMd.Product.Name],
        stackBy: ReferenceMd.Region,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region, ["East Coast"])],
    })
    .addScenario("single measure with two viewBy and stack", ColumnChartWithSingleMeasureAndTwoViewByAndStack)
    .addScenario(
        "single measure with one viewBy and one stackBy with multiple items",
        ColumnChartWithSingleMeasureAndViewByAndStackMultipleItems,
    )
    .addScenario("two measures", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
    })
    .addScenario("two measures with viewBy", ColumnChartWithTwoMeasuresAndViewBy)
    .addScenario("two measures with two viewBy", ColumnChartWithTwoMeasuresAndTwoViewBy)
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
    .addScenario("viewBy date and PoP measure", ColumnChartViewByDateAndPop)
    .addScenario("dense chart with two view by", {
        measures: [ReferenceMd.Amount_1.Sum],
        filters: [newMeasureValueFilter(ReferenceMd.Amount_1.Sum, "GREATER_THAN", 5000000)],
        viewBy: [ReferenceMd.Product.Name, ReferenceMd.Opportunity.Name],
    })
    .addScenario("viewBy with two dates", ColumnChartViewByTwoDates)
    .addScenario("stackBy with one date", ColumnChartStackByDate);
