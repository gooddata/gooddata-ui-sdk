// (C) 2007-2019 GoodData Corporation
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { BubbleChart, IBubbleChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { newAttributeSort } from "@gooddata/sdk-model";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const BubbleChartWithAllMeasuresAndAttribute = {
    xAxisMeasure: ReferenceMd.Amount,
    yAxisMeasure: ReferenceMd.WinRate,
    size: ReferenceMd.Probability,
    viewBy: ReferenceMd.Product.Name,
};

export default scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("x axis measure", {
        xAxisMeasure: ReferenceMd.Amount,
    })
    .addScenario("x axis measure with viewBy", {
        xAxisMeasure: ReferenceMd.Amount,
        viewBy: ReferenceMd.Product.Name,
    })
    .addScenario("x axis and size measures with viewBy", {
        xAxisMeasure: ReferenceMd.Amount,
        size: ReferenceMd.Probability,
        viewBy: ReferenceMd.Product.Name,
    })
    .addScenario("x and y axis measures with viewBy", {
        xAxisMeasure: ReferenceMd.Amount,
        yAxisMeasure: ReferenceMd.WinRate,
        viewBy: ReferenceMd.Product.Name,
    })
    .addScenario("x and y axis and size measures with viewBy", BubbleChartWithAllMeasuresAndAttribute)
    .addScenario("y axis and size measures with viewBy", {
        yAxisMeasure: ReferenceMd.Amount,
        size: ReferenceMd.Probability,
        viewBy: ReferenceMd.Product.Name,
    })
    .addScenario("arithmetic measure", {
        xAxisMeasure: ReferenceMd.Amount,
        yAxisMeasure: ReferenceMd.Won,
        size: ReferenceMdExt.CalculatedLost,
        viewBy: ReferenceMd.Product.Name,
    })
    .addScenario("x and y axis and size measures with viewBy and sorted by attr", {
        xAxisMeasure: ReferenceMd.Amount,
        yAxisMeasure: ReferenceMd.WinRate,
        size: ReferenceMd.Probability,
        viewBy: ReferenceMd.Product.Name,
        sortBy: [newAttributeSort(ReferenceMd.Product.Name, "desc")],
    })
    .addScenario("x and y axis and size measures with viewBy with nulls in data", {
        xAxisMeasure: ReferenceMd.Amount,
        yAxisMeasure: ReferenceMd.WinRate,
        size: ReferenceMd.Probability,
        viewBy: ReferenceMd.DateDatasets.Closed.Year.Default,
    });
