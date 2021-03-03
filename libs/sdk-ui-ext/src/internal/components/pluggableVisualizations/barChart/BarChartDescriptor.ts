// (C) 2021 GoodData Corporation

import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableBarChart } from "./PluggableBarChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";

export class BarChartDescriptor extends BaseChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableBarChart(params);
    }
}
