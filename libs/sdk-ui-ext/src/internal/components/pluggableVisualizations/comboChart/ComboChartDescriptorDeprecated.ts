// (C) 2021-2022 GoodData Corporation
import {
    IVisualizationMeta,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import { PluggableComboChartDeprecated } from "./PluggableComboChartDeprecated.js";
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
