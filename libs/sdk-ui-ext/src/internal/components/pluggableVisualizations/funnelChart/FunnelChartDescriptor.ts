// (C) 2021 GoodData Corporation

import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableFunnelChart } from "./PluggableFunnelChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";

export class FunnelChartDescriptor extends BaseChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableFunnelChart(params);
    }
}
