// (C) 2007-2026 GoodData Corporation

import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { newAttributeSort, newMeasureSort } from "@gooddata/sdk-model";
import { FunnelChart, type IFunnelChartProps } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

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

export const base = scenariosFor<IFunnelChartProps>("FunnelChart", FunnelChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
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
