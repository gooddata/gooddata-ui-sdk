// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { BubbleChart, IBubbleChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";

export default scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .addScenario("x axis measure", {
        xAxisMeasure: ReferenceLdm.Amount,
    })
    .addScenario("x axis measure with viewBy", {
        xAxisMeasure: ReferenceLdm.Amount,
        viewBy: ReferenceLdm.Product.Name,
    })
    .addScenario("x and y axis measures with viewBy", {
        xAxisMeasure: ReferenceLdm.Amount,
        yAxisMeasure: ReferenceLdm.WinRate,
        viewBy: ReferenceLdm.Product.Name,
    })
    .addScenario("x and y axis and size measures with viewBy", {
        xAxisMeasure: ReferenceLdm.Amount,
        yAxisMeasure: ReferenceLdm.WinRate,
        size: ReferenceLdm.Probability,
        viewBy: ReferenceLdm.Product.Name,
    });
