// (C) 2007-2019 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { ScatterPlot, IScatterPlotProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { newAttributeSort } from "@gooddata/sdk-model";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const ScatterPlotWithMeasuresAndAttribute = {
    xAxisMeasure: ReferenceMd.Amount,
    yAxisMeasure: ReferenceMd.WinRate,
    attribute: ReferenceMd.Product.Name,
};

/*
 * TODO: omitted stories:
 *  - long name of X and Y axes are truncated
 */

export default scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("x axis measure", {
        xAxisMeasure: ReferenceMd.Amount,
    })
    .addScenario("x axis measure and attribute", {
        xAxisMeasure: ReferenceMd.Amount,
        attribute: ReferenceMd.Product.Name,
    })
    .addScenario("y axis measure and attribute", {
        yAxisMeasure: ReferenceMd.Amount,
        attribute: ReferenceMd.Product.Name,
    })
    .addScenario("x and y axis measures and attribute", ScatterPlotWithMeasuresAndAttribute)
    .addScenario("x and y axis measures and attribute with attr sorting", {
        xAxisMeasure: ReferenceMd.Amount,
        yAxisMeasure: ReferenceMd.WinRate,
        attribute: ReferenceMd.Product.Name,
        sortBy: [newAttributeSort(ReferenceMd.Product.Name, "desc")],
    })
    .addScenario("x and y axis measures and attribute with nulls in data", {
        xAxisMeasure: ReferenceMd.Amount,
        yAxisMeasure: ReferenceMd.WinRate,
        attribute: ReferenceMd.DateDatasets.Closed.Year.Default,
    });
