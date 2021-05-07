// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { ColumnChart, IColumnChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import {
    newAttributeSort,
    newMeasureSort,
    newMeasureValueFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { ScenarioGroupNames } from "../_infra/groupNames";

export const ColumnChartWithSingleMeasureAndViewBy = {
    measures: [ReferenceLdm.Amount],
    viewBy: [ReferenceLdm.Product.Name],
};

export const ColumnChartWithSingleMeasureViewByAndStackBy = {
    measures: [ReferenceLdm.Amount],
    viewBy: [ReferenceLdm.Product.Name],
    stackBy: ReferenceLdm.Region,
};

export const ColumnChartWithTwoMeasuresAndViewBy = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    viewBy: [ReferenceLdm.Product.Name],
};

export const ColumnChartWithTwoMeasuresAndTwoViewBy = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    viewBy: [ReferenceLdm.Product.Name, ReferenceLdm.Region],
};

export const ColumnChartWithSingleMeasureAndViewByAndStackMultipleItems = {
    measures: [ReferenceLdm.Amount],
    viewBy: [ReferenceLdm.Region],
    stackBy: ReferenceLdm.Product.Name,
};

export const ColumnChartWithSingleMeasureAndTwoViewByAndStack = {
    measures: [ReferenceLdm.Amount],
    viewBy: [ReferenceLdm.Product.Name, ReferenceLdm.Region],
    stackBy: ReferenceLdm.Department,
};

export const ColumnChartWithArithmeticMeasuresAndViewBy = {
    measures: [
        ReferenceLdm.Amount,
        ReferenceLdm.Won,
        ReferenceLdmExt.CalculatedLost,
        ReferenceLdmExt.CalculatedWonLostRatio,
    ],
    viewBy: [ReferenceLdm.Product.Name],
};

export const ColumnChartViewByDateAndPop = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won, ReferenceLdmExt.WonPopClosedYear],
    viewBy: [ReferenceLdm.ClosedYear],
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
        measures: [ReferenceLdm.Amount],
    })
    .addScenario("single measure with viewBy", ColumnChartWithSingleMeasureAndViewBy)
    .addScenario("single ratio measure with viewBy", {
        measures: [ReferenceLdmExt.AmountWithRatio],
        viewBy: [ReferenceLdm.Product.Name],
    })
    .addScenario("single measure with viewBy and stackBy", ColumnChartWithSingleMeasureViewByAndStackBy)
    .addScenario("single measure with viewBy and stackBy filtered to single stack", {
        measures: [ReferenceLdm.Amount],
        viewBy: [ReferenceLdm.Product.Name],
        stackBy: ReferenceLdm.Region,
        filters: [newPositiveAttributeFilter(ReferenceLdm.Region, ["East Coast"])],
    })
    .addScenario("single measure with two viewBy and stack", ColumnChartWithSingleMeasureAndTwoViewByAndStack)
    .addScenario(
        "single measure with one viewBy and one stackBy with multiple items",
        ColumnChartWithSingleMeasureAndViewByAndStackMultipleItems,
    )
    .addScenario("two measures", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    })
    .addScenario("two measures with viewBy", ColumnChartWithTwoMeasuresAndViewBy)
    .addScenario("two measures with two viewBy", ColumnChartWithTwoMeasuresAndTwoViewBy)
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
    .addScenario("viewBy date and PoP measure", ColumnChartViewByDateAndPop)
    .addScenario("dense chart with two view by", {
        measures: [ReferenceLdm.Amount_1.Sum],
        filters: [newMeasureValueFilter(ReferenceLdm.Amount_1.Sum, "GREATER_THAN", 5000000)],
        viewBy: [ReferenceLdm.Product.Name, ReferenceLdm.Opportunity.Name],
    });
