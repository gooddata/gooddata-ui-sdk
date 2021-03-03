// (C) 2021 GoodData Corporation

import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableDonutChart } from "./PluggableDonutChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";

export class DonutChartDescriptor extends BaseChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableDonutChart(params);
    }
}
