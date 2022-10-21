// (C) 2021-2022 GoodData Corporation
import {
    IVisualizationMeta,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableComboChartDeprecated } from "./PluggableComboChartDeprecated";
import { BigChartDescriptor } from "../BigChartDescriptor";

export class ComboChartDescriptorDeprecated extends BigChartDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableComboChartDeprecated(params);
    }

    public getMeta(): IVisualizationMeta {
        return {
            supportsExport: true,
            supportsZooming: true,
        };
    }
}
