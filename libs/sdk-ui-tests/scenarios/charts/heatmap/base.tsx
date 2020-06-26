// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { Heatmap, IHeatmapProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";

export const HeatmapWithMeasureRowsAndColumns = {
    measure: ReferenceLdm.Amount,
    rows: ReferenceLdm.Product.Name,
    columns: ReferenceLdm.Region,
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
        measure: ReferenceLdm.Amount,
    })
    .addScenario("measure and rows", {
        measure: ReferenceLdm.Amount,
        rows: ReferenceLdm.Product.Name,
    })
    .addScenario("measure and columns", {
        measure: ReferenceLdm.Amount,
        columns: ReferenceLdm.Product.Name,
    })
    .addScenario("measure, rows and columns", HeatmapWithMeasureRowsAndColumns)
    .addScenario("measure, rows and columns with null data points", {
        measure: ReferenceLdm.Amount,
        rows: ReferenceLdm.Product.Name,
        columns: ReferenceLdm.ClosedYear,
    });
