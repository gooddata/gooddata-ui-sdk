// (C) 2007-2025 GoodData Corporation
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { ITreemapProps, Treemap } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const TreemapWithArithmeticMeasuresAndSegment = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won, ReferenceMdExt.CalculatedLost],
    segmentBy: ReferenceMd.DateDatasets.Created.CreatedQuarterYear.Default,
};

export const TreemapWithMeasureViewByAndSegmentBy = {
    measures: [ReferenceMd.Amount],
    viewBy: ReferenceMd.Product.Name,
    segmentBy: ReferenceMd.Region.Default,
};

export const TreemapWithViewByDateAndStackByDate = {
    measures: [ReferenceMd.Amount],
    viewBy: ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
    segmentBy: ReferenceMd.DateDatasets.Created.CreatedYear.Default,
};

export default scenariosFor<ITreemapProps>("Treemap", Treemap)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("single measure", {
        measures: [ReferenceMd.Amount],
    })
    .addScenario("single measure and segment", {
        measures: [ReferenceMd.Amount],
        segmentBy: ReferenceMd.Region.Default,
    })
    .addScenario("two measures", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
    })
    .addScenario("single measure and viewBy", {
        measures: [ReferenceMd.Amount],
        viewBy: ReferenceMd.Product.Name,
    })
    .addScenario("single measure and viewBy filtered to one element", {
        measures: [ReferenceMd.Amount],
        viewBy: ReferenceMd.Product.Name,
        filters: [newPositiveAttributeFilter(ReferenceMd.Product.Name, ["CompuSci"])],
    })
    .addScenario("single measure, viewBy and segment", TreemapWithMeasureViewByAndSegmentBy)
    .addScenario("two measures and viewBy", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        viewBy: ReferenceMd.Product.Name,
    })
    .addScenario("two measures and segmentBy", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        segmentBy: ReferenceMd.Product.Name,
    })
    .addScenario("arithmetic measures and segment", TreemapWithArithmeticMeasuresAndSegment)
    .addScenario(
        "with one measure and view by date and segment by date",
        TreemapWithViewByDateAndStackByDate,
    );
