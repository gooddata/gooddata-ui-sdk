// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { ScatterPlot, IScatterPlotProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";

export default scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .addScenario("x axis measure", {
        xAxisMeasure: ReferenceLdm.Amount,
    })
    .addScenario("x axis measure and attribute", {
        xAxisMeasure: ReferenceLdm.Amount,
        attribute: ReferenceLdm.Product.Name,
    })
    .addScenario("x and y axis measures and attribute", {
        xAxisMeasure: ReferenceLdm.Amount,
        yAxisMeasure: ReferenceLdm.WinRate,
        attribute: ReferenceLdm.Product.Name,
    });
