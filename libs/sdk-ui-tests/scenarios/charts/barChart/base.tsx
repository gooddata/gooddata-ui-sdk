// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { newAttributeSort, newMeasureSort, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";

export const BarChartWithSingleMeasureAndViewBy = {
    measures: [ReferenceLdm.Amount],
    viewBy: [ReferenceLdm.Product.Name],
};

export const BarChartWithSingleMeasureViewByAndStackBy = {
    measures: [ReferenceLdm.Amount],
    viewBy: [ReferenceLdm.Product.Name],
    stackBy: ReferenceLdm.Region,
};

export const BarChartWithTwoMeasuresAndViewBy = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    viewBy: [ReferenceLdm.Product.Name],
};

export const BarChartWithTwoMeasuresAndTwoViewBy = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    viewBy: [ReferenceLdm.Product.Name, ReferenceLdm.Region],
};

export const BarChartWithTwoMeasuresAndTwoViewByFiltered = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    viewBy: [ReferenceLdm.Product.Name, ReferenceLdm.Region],
    filters: [
        newPositiveAttributeFilter(ReferenceLdm.Product.Name, ["WonderKid"]),
        newPositiveAttributeFilter(ReferenceLdm.Region, ["East Coast"]),
    ],
};

export const BarChartWithSingleMeasureAndTwoViewByAndStack = {
    measures: [ReferenceLdm.Amount],
    viewBy: [ReferenceLdm.Product.Name, ReferenceLdm.Region],
    stackBy: ReferenceLdm.Department,
};

export const BarChartWithArithmeticMeasuresAndViewBy = {
    measures: [
        ReferenceLdm.Amount,
        ReferenceLdm.Won,
        ReferenceLdmExt.CalculatedLost,
        ReferenceLdmExt.CalculatedWonLostRatio,
    ],
    viewBy: [ReferenceLdm.Product.Name],
};

export const BarChartViewByDateAndPop = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won, ReferenceLdmExt.WonPopClosedYear],
    viewBy: [ReferenceLdm.ClosedYear],
};

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .addScenario("single measure", {
        measures: [ReferenceLdm.Amount],
    })
    .addScenario("single measure with viewBy", BarChartWithSingleMeasureAndViewBy)
    .addScenario("single measure with viewBy and stackBy", BarChartWithSingleMeasureViewByAndStackBy)
    .addScenario("single measure with two viewBy and stack", BarChartWithSingleMeasureAndTwoViewByAndStack)
    .addScenario("two measures with viewBy", BarChartWithTwoMeasuresAndViewBy)
    .addScenario("two measures with two viewBy", BarChartWithTwoMeasuresAndTwoViewBy)
    .addScenario(
        "two measures with two viewBy, filtered to single value",
        BarChartWithTwoMeasuresAndTwoViewByFiltered,
    )
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
    .addScenario("viewBy date and PoP measure", BarChartViewByDateAndPop)
    .addScenario("arithmetic measures", BarChartWithArithmeticMeasuresAndViewBy)
    .addScenario("four measures and PoP", {
        measures: [
            ReferenceLdm.Amount,
            ReferenceLdm.Won,
            ReferenceLdmExt.WonPopClosedYear,
            ReferenceLdmExt.CalculatedLost,
            ReferenceLdmExt.CalculatedWonLostRatio,
        ],
        viewBy: [ReferenceLdm.ClosedYear],
    });
