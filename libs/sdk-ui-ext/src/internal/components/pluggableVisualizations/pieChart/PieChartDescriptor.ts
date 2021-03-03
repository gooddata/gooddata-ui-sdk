// (C) 2021 GoodData Corporation

import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggablePieChart } from "./PluggablePieChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";

export class PieChartDescriptor extends BaseChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggablePieChart(params);
    }
}
