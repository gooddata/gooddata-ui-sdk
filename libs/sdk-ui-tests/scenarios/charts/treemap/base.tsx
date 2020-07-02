// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { Treemap, ITreemapProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { ScenarioGroupNames } from "../_infra/groupNames";

export const TreemapWithArithmeticMeasuresAndSegment = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won, ReferenceLdmExt.CalculatedLost],
    segmentBy: ReferenceLdm.CreatedQuarterYear,
};

export const TreemapWithMeasureViewByAndSegmentBy = {
    measures: [ReferenceLdm.Amount],
    viewBy: ReferenceLdm.Product.Name,
    segmentBy: ReferenceLdm.Region,
};

export default scenariosFor<ITreemapProps>("Treemap", Treemap)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("single measure", {
        measures: [ReferenceLdm.Amount],
    })
    .addScenario("single measure and segment", {
        measures: [ReferenceLdm.Amount],
        segmentBy: ReferenceLdm.Region,
    })
    .addScenario("two measures", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    })
    .addScenario("single measure and viewBy", {
        measures: [ReferenceLdm.Amount],
        viewBy: ReferenceLdm.Product.Name,
    })
    .addScenario("single measure and viewBy filtered to one element", {
        measures: [ReferenceLdm.Amount],
        viewBy: ReferenceLdm.Product.Name,
        filters: [newPositiveAttributeFilter(ReferenceLdm.Product.Name, ["CompuSci"])],
    })
    .addScenario("single measure, viewBy and segment", TreemapWithMeasureViewByAndSegmentBy)
    .addScenario("two measures and viewBy", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
        viewBy: ReferenceLdm.Product.Name,
    })
    .addScenario("two measures and segmentBy", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
        segmentBy: ReferenceLdm.Product.Name,
    })
    .addScenario("arithmetic measures and segment", TreemapWithArithmeticMeasuresAndSegment);
