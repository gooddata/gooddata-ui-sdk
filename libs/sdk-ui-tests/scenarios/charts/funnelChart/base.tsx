// (C) 2007-2019 GoodData Corporation
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { newAttributeSort, newMeasureSort } from "@gooddata/sdk-model";
import { FunnelChart, IFunnelChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";

export const FunnelChartWithMeasureAndViewBy = {
    measures: [ReferenceMd.Amount],
    viewBy: ReferenceMd.Product.Name,
};

export const FunnelChartWithTwoMeasures = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
};

export const FunnelChartWithArithmeticMeasures = {
    measures: [ReferenceMd.Amount, ReferenceMdExt.CalculatedLost, ReferenceMd.Won],
};

export default scenariosFor<IFunnelChartProps>("FunnelChart", FunnelChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("single measure", {
        measures: [ReferenceMd.Amount],
    })
    .addScenario("two measures", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
    })
    .addScenario("single measure with viewBy", FunnelChartWithMeasureAndViewBy)
    .addScenario("single measure with viewBy sorted by attribute", {
        measures: [ReferenceMd.Amount],
        viewBy: ReferenceMd.Product.Name,
        sortBy: [newAttributeSort(ReferenceMd.Product.Name, "desc")],
        config: { enableChartSorting: true },
    })
    .addScenario("single measure with viewBy sorted by measure", {
        measures: [ReferenceMd.Amount],
        viewBy: ReferenceMd.Product.Name,
        sortBy: [newMeasureSort(ReferenceMd.Amount, "asc")],
        config: { enableChartSorting: true },
    })
    .addScenario("arithmetic measures", FunnelChartWithArithmeticMeasures);
