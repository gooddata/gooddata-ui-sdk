// (C) 2021 GoodData Corporation

import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableLineChart } from "./PluggableLineChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";

export class LineChartDescriptor extends BaseChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableLineChart(params);
    }
}
