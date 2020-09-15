// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { ComboChart, IComboChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { newAttributeSort, newMeasureSort, newMeasureValueFilter } from "@gooddata/sdk-model";
import { ScenarioGroupNames } from "../_infra/groupNames";

export type ComboChartTypes = "area" | "column" | "line";

export const ComboChartWithTwoMeasuresAndNoViewBy = {
    primaryMeasures: [ReferenceLdm.Amount],
    secondaryMeasures: [ReferenceLdm.Won],
};

export const ComboChartWithTwoSecondaryMeasures = {
    secondaryMeasures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    viewBy: [ReferenceLdm.Product.Name],
};

export const ComboChartWithMultipleMeasuresAndNoViewBy = {
    primaryMeasures: [ReferenceLdm.Amount, ReferenceLdm.Won, ReferenceLdmExt.CalculatedLost],
    secondaryMeasures: [ReferenceLdmExt.CalculatedWonLostRatio],
};

export const ComboChartWithTwoMeasuresAndViewBy = {
    primaryMeasures: [ReferenceLdm.Amount],
    secondaryMeasures: [ReferenceLdm.Won],
    viewBy: [ReferenceLdm.Product.Name],
};

export const ComboChartWithArithmeticMeasuresAndViewBy = {
    primaryMeasures: [ReferenceLdm.Amount, ReferenceLdm.Won, ReferenceLdmExt.CalculatedLost],
    secondaryMeasures: [ReferenceLdmExt.CalculatedWonLostRatio],
    viewBy: [ReferenceLdm.Product.Name],
};

export const ComboChartWithManyPrimaryAndSecondaryMeasuresAndViewBy = {
    primaryMeasures: [ReferenceLdmExt.MinAmount, ReferenceLdmExt.MedianAmount, ReferenceLdmExt.MaxAmount],
    secondaryMeasures: [ReferenceLdm.Amount, ReferenceLdm.Won, ReferenceLdmExt.CalculatedLost],
    viewBy: [ReferenceLdm.Product.Name],
};

export const ComboChartWithManyDataPoints = {
    primaryMeasures: [ReferenceLdm.Amount],
    secondaryMeasures: [ReferenceLdm.Won],
    filters: [newMeasureValueFilter(ReferenceLdm.Amount, "GREATER_THAN", 200000)],
    viewBy: ReferenceLdm.Opportunity.Name,
};

export default scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("one primary measure", {
        primaryMeasures: [ReferenceLdm.Amount],
    })
    .addScenario("one primary measure with viewBy", {
        primaryMeasures: [ReferenceLdm.Amount],
        viewBy: [ReferenceLdm.Product.Name],
    })
    .addScenario("two secondary measure with viewBy", ComboChartWithManyDataPoints)
    .addScenario("one secondary measure with viewBy", {
        secondaryMeasures: [ReferenceLdm.Amount],
        viewBy: [ReferenceLdm.Product.Name],
    })
    .addScenario("one primary and secondary measure no viewBy", ComboChartWithTwoMeasuresAndNoViewBy)
    .addScenario("one primary and secondary measure with viewBy sorted by attr", {
        primaryMeasures: [ReferenceLdm.Amount],
        secondaryMeasures: [ReferenceLdm.Won],
        viewBy: [ReferenceLdm.Product.Name],
        sortBy: [newAttributeSort(ReferenceLdm.Product.Name, "desc")],
    })
    .addScenario("one primary and secondary measure with viewBy sorted by primary measure", {
        primaryMeasures: [ReferenceLdm.Amount],
        secondaryMeasures: [ReferenceLdm.Won],
        viewBy: [ReferenceLdm.Product.Name],
        sortBy: [newMeasureSort(ReferenceLdm.Amount, "desc")],
    })
    .addScenario("one primary and secondary measure with viewBy sorted by secondary measure", {
        primaryMeasures: [ReferenceLdm.Amount],
        secondaryMeasures: [ReferenceLdm.Won],
        viewBy: [ReferenceLdm.Product.Name],
        sortBy: [newMeasureSort(ReferenceLdm.Won, "desc")],
    })
    .addScenario("one primary and secondary measure with viewBy", ComboChartWithTwoMeasuresAndViewBy)
    .addScenario(
        "multiple primary and secondary measures with viewBy",
        ComboChartWithManyPrimaryAndSecondaryMeasuresAndViewBy,
    )
    .addScenario("multiple measures and no viewBy", ComboChartWithMultipleMeasuresAndNoViewBy)
    .addScenario("arithmetic measures", ComboChartWithArithmeticMeasuresAndViewBy);
