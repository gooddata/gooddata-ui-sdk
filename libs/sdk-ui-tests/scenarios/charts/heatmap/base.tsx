// (C) 2007-2019 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { Heatmap, IHeatmapProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const HeatmapWithMeasureRowsAndColumns = {
    measure: ReferenceMd.Amount,
    rows: ReferenceMd.Product.Name,
    columns: ReferenceMd.Region,
};

export const HeatmapWithNullDataPoints = {
    measure: ReferenceMd.Amount,
    rows: ReferenceMd.Product.Name,
    columns: ReferenceMd.DateDatasets.Closed.Year.Default,
};

/*
 * TODO: stories not transferred:
 *  - with left out some label of yaxis
 *  - with last label of yaxis exceed top grid line
 *  - tooltip for chart with small width and long names
 *  - all of these are visual verification of bugfixes.. need to find a good way to do this (or just don't do it?)
 */
export default scenariosFor<IHeatmapProps>("Heatmap", Heatmap)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 800 } })
    .addScenario("measure only", {
        measure: ReferenceMd.Amount,
    })
    .addScenario("measure and rows", {
        measure: ReferenceMd.Amount,
        rows: ReferenceMd.Product.Name,
    })
    .addScenario("measure and columns", {
        measure: ReferenceMd.Amount,
        columns: ReferenceMd.Product.Name,
    })
    .addScenario("measure, rows and columns", HeatmapWithMeasureRowsAndColumns)
    .addScenario("measure, rows and columns with null data points", HeatmapWithNullDataPoints);
