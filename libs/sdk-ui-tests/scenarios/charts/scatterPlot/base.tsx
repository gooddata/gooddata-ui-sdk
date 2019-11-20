// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { ScatterPlot, IScatterPlotProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { newAttributeSort } from "@gooddata/sdk-model";

export const ScatterPlotWithMeasuresAndAttribute = {
    xAxisMeasure: ReferenceLdm.Amount,
    yAxisMeasure: ReferenceLdm.WinRate,
    attribute: ReferenceLdm.Product.Name,
};

/*
 * TODO: omitted stories:
 *  - long name of X and Y axes are truncated
 */

export default scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .addScenario("x axis measure", {
        xAxisMeasure: ReferenceLdm.Amount,
    })
    .addScenario("x axis measure and attribute", {
        xAxisMeasure: ReferenceLdm.Amount,
        attribute: ReferenceLdm.Product.Name,
    })
    .addScenario("y axis measure and attribute", {
        yAxisMeasure: ReferenceLdm.Amount,
        attribute: ReferenceLdm.Product.Name,
    })
    .addScenario("x and y axis measures and attribute", ScatterPlotWithMeasuresAndAttribute)
    .addScenario("x and y axis measures and attribute with attr sorting", {
        xAxisMeasure: ReferenceLdm.Amount,
        yAxisMeasure: ReferenceLdm.WinRate,
        attribute: ReferenceLdm.Product.Name,
        sortBy: [newAttributeSort(ReferenceLdm.Product.Name, "desc")],
    });
