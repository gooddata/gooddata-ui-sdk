// (C) 2021 GoodData Corporation
import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableBubbleChart } from "./PluggableBubbleChart";
import { BigChartDescriptor } from "../BigChartDescriptor";

export class BubbleChartDescriptor extends BigChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableBubbleChart(params);
    }
}
