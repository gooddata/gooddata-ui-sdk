// (C) 2021 GoodData Corporation
import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableComboChart } from "./PluggableComboChart";
import { BigChartDescriptor } from "../BigChartDescriptor";

export class ComboChartDescriptor extends BigChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableComboChart(params);
    }
}
