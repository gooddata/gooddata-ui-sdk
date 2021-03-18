// (C) 2021 GoodData Corporation
import { PluggableVisualizationFactory } from "../../../interfaces/VisualizationDescriptor";
import { PluggableComboChartDeprecated } from "./PluggableComboChartDeprecated";
import { BigChartDescriptor } from "../BigChartDescriptor";

export class ComboChartDescriptorDeprecated extends BigChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableComboChartDeprecated(params);
    }
}
