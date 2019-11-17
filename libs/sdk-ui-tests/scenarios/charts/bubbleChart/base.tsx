// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { BubbleChart, IBubbleChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { newAttributeSort } from "@gooddata/sdk-model";

export const BubbleChartWithAllMeasuresAndAttribute = {
    xAxisMeasure: ReferenceLdm.Amount,
    yAxisMeasure: ReferenceLdm.WinRate,
    size: ReferenceLdm.Probability,
    viewBy: ReferenceLdm.Product.Name,
};

export default scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .addScenario("x axis measure", {
        xAxisMeasure: ReferenceLdm.Amount,
    })
    .addScenario("x axis measure with viewBy", {
        xAxisMeasure: ReferenceLdm.Amount,
        viewBy: ReferenceLdm.Product.Name,
    })
    .addScenario("x axis and size measures with viewBy", {
        xAxisMeasure: ReferenceLdm.Amount,
        size: ReferenceLdm.Probability,
        viewBy: ReferenceLdm.Product.Name,
    })
    .addScenario("x and y axis measures with viewBy", {
        xAxisMeasure: ReferenceLdm.Amount,
        yAxisMeasure: ReferenceLdm.WinRate,
        viewBy: ReferenceLdm.Product.Name,
    })
    .addScenario("x and y axis and size measures with viewBy", BubbleChartWithAllMeasuresAndAttribute)
    .addScenario("arithmetic measure", {
        xAxisMeasure: ReferenceLdm.Amount,
        yAxisMeasure: ReferenceLdm.Won,
        size: ReferenceLdmExt.CalculatedLost,
        viewBy: ReferenceLdm.Product.Name,
    })
    .addScenario("x and y axis and size measures with viewBy and sorted by attr", {
        xAxisMeasure: ReferenceLdm.Amount,
        yAxisMeasure: ReferenceLdm.WinRate,
        size: ReferenceLdm.Probability,
        viewBy: ReferenceLdm.Product.Name,
        sortBy: [newAttributeSort(ReferenceLdm.Product.Name, "desc")],
    });
