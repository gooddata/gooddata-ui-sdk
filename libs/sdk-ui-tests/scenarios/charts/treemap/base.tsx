// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { Treemap, ITreemapProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";

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
    .addScenario("single measure", {
        measures: [ReferenceLdm.Amount],
    })
    .addScenario("two measures", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    })
    .addScenario("single measure and viewBy", {
        measures: [ReferenceLdm.Amount],
        viewBy: ReferenceLdm.Product.Name,
    })
    .addScenario("single measure, viewBy and segment", TreemapWithMeasureViewByAndSegmentBy)
    .addScenario("two measures and viewBy", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
        viewBy: ReferenceLdm.Product.Name,
    })
    .addScenario("arithmetic measures and segment", TreemapWithArithmeticMeasuresAndSegment);
