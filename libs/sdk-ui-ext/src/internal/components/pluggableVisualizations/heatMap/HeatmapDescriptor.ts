// (C) 2021 GoodData Corporation
import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableHeatmap } from "./PluggableHeatmap";
import { BigChartDescriptor } from "../BigChartDescriptor";

export class HeatmapDescriptor extends BigChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableHeatmap(params);
    }
}
