// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { newAttributeSort } from "@gooddata/sdk-model";
import { FunnelChart, IFunnelChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";

export const FunnelChartWithMeasureAndViewBy = {
    measures: [ReferenceLdm.Amount],
    viewBy: ReferenceLdm.Product.Name,
};

export const FunnelChartWithArithmeticMeasures = {
    measures: [ReferenceLdm.Amount, ReferenceLdmExt.CalculatedLost, ReferenceLdm.Won],
};

export default scenariosFor<IFunnelChartProps>("FunnelChart", FunnelChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("single measure", {
        measures: [ReferenceLdm.Amount],
    })
    .addScenario("two measures", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    })
    .addScenario("single measure with viewBy", FunnelChartWithMeasureAndViewBy)
    .addScenario("single measure with viewBy sorted by attribute", {
        measures: [ReferenceLdm.Amount],
        viewBy: ReferenceLdm.Product.Name,
        sortBy: [newAttributeSort(ReferenceLdm.Product.Name, "desc")],
    })
    .addScenario("arithmetic measures", FunnelChartWithArithmeticMeasures);
