// (C) 2021-2026 GoodData Corporation

import {
    type IVisualizationMeta,
    type PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor.js";
import { BigChartDescriptor } from "../BigChartDescriptor.js";
import { PluggableComboChartDeprecated } from "./PluggableComboChartDeprecated.js";

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
