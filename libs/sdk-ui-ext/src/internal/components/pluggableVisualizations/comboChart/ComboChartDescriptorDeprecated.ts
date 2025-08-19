// (C) 2021-2025 GoodData Corporation
import { PluggableComboChartDeprecated } from "./PluggableComboChartDeprecated.js";
import {
    IVisualizationMeta,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import { BigChartDescriptor } from "../BigChartDescriptor.js";

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
