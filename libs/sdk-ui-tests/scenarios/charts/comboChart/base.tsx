// (C) 2007-2019 GoodData Corporation
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { ComboChart, IComboChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { newAttributeSort, newMeasureSort, newMeasureValueFilter } from "@gooddata/sdk-model";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export type ComboChartTypes = "area" | "column" | "line";

export const ComboChartWithTwoMeasuresAndNoViewBy = {
    primaryMeasures: [ReferenceMd.Amount],
    secondaryMeasures: [ReferenceMd.Won],
};

export const ComboChartWithTwoSecondaryMeasures = {
    secondaryMeasures: [ReferenceMd.Amount, ReferenceMd.Won],
    viewBy: [ReferenceMd.Product.Name],
};

export const ComboChartWithMultipleMeasuresAndNoViewBy = {
    primaryMeasures: [ReferenceMd.Amount, ReferenceMd.Won, ReferenceMdExt.CalculatedLost],
    secondaryMeasures: [ReferenceMdExt.CalculatedWonLostRatio],
};

export const ComboChartWithTwoMeasuresAndViewBy = {
    primaryMeasures: [ReferenceMd.Amount],
    secondaryMeasures: [ReferenceMd.Won],
    viewBy: [ReferenceMd.Product.Name],
};

export const ComboChartWithArithmeticMeasuresAndViewBy = {
    primaryMeasures: [ReferenceMd.Amount, ReferenceMd.Won, ReferenceMdExt.CalculatedLost],
    secondaryMeasures: [ReferenceMdExt.CalculatedWonLostRatio],
    viewBy: [ReferenceMd.Product.Name],
};

export const ComboChartWithManyPrimaryAndSecondaryMeasuresAndViewBy = {
    primaryMeasures: [ReferenceMdExt.MinAmount, ReferenceMdExt.MedianAmount, ReferenceMdExt.MaxAmount],
    secondaryMeasures: [ReferenceMd.Amount, ReferenceMd.Won, ReferenceMdExt.CalculatedLost],
    viewBy: [ReferenceMd.Product.Name],
};

export const ComboChartWithManyDataPoints = {
    primaryMeasures: [ReferenceMd.Amount],
    secondaryMeasures: [ReferenceMd.Won],
    filters: [newMeasureValueFilter(ReferenceMd.Amount, "GREATER_THAN", 100000)],
    viewBy: ReferenceMd.Opportunity.Name,
};

export const ComboChartViewByDate = {
    primaryMeasures: [ReferenceMd.Amount],
    secondaryMeasures: [ReferenceMd.Won],
    viewBy: ReferenceMd.DateDatasets.Closed.Year.Default,
};

export default scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("one primary measure", {
        primaryMeasures: [ReferenceMd.Amount],
    })
    .addScenario("one primary measure with viewBy", {
        primaryMeasures: [ReferenceMd.Amount],
        viewBy: [ReferenceMd.Product.Name],
    })
    .addScenario("two secondary measure with viewBy", ComboChartWithTwoSecondaryMeasures)
    .addScenario("one secondary measure with viewBy", {
        secondaryMeasures: [ReferenceMd.Amount],
        viewBy: [ReferenceMd.Product.Name],
    })
    .addScenario("one primary and secondary measure no viewBy", ComboChartWithTwoMeasuresAndNoViewBy)
    .addScenario("one primary and secondary measure with viewBy sorted by attr", {
        primaryMeasures: [ReferenceMd.Amount],
        secondaryMeasures: [ReferenceMd.Won],
        viewBy: [ReferenceMd.Product.Name],
        sortBy: [newAttributeSort(ReferenceMd.Product.Name, "desc")],
    })
    .addScenario("one primary and secondary measure with viewBy sorted by primary measure", {
        primaryMeasures: [ReferenceMd.Amount],
        secondaryMeasures: [ReferenceMd.Won],
        viewBy: [ReferenceMd.Product.Name],
        sortBy: [newMeasureSort(ReferenceMd.Amount, "desc")],
    })
    .addScenario("one primary and secondary measure with viewBy sorted by secondary measure", {
        primaryMeasures: [ReferenceMd.Amount],
        secondaryMeasures: [ReferenceMd.Won],
        viewBy: [ReferenceMd.Product.Name],
        sortBy: [newMeasureSort(ReferenceMd.Won, "desc")],
    })
    .addScenario("one primary and secondary measure with viewBy", ComboChartWithTwoMeasuresAndViewBy)
    .addScenario(
        "multiple primary and secondary measures with viewBy",
        ComboChartWithManyPrimaryAndSecondaryMeasuresAndViewBy,
    )
    .addScenario("multiple measures and no viewBy", ComboChartWithMultipleMeasuresAndNoViewBy)
    .addScenario("arithmetic measures", ComboChartWithArithmeticMeasuresAndViewBy)
    .addScenario("two measures with null values", ComboChartViewByDate);
