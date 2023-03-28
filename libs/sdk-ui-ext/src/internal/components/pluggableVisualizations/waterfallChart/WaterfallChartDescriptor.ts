// (C) 2021-2023 GoodData Corporation
import {
    IEmbeddingCodeConfig,
    IVisualizationDescriptor,
    IVisualizationMeta,
    PluggableVisualizationFactory,
} from "../../../interfaces/VisualizationDescriptor";
import { PluggableWaterfallChart } from "./PluggableWaterfallChart";
import { BaseChartDescriptor } from "../baseChart/BaseChartDescriptor";
import { IInsightDefinition } from "@gooddata/sdk-model";

export class WaterfallChartDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableWaterfallChart(params);
    }

    public getEmbeddingCode(_insight: IInsightDefinition, _config?: IEmbeddingCodeConfig): string {
        return "";
    }

    public getMeta(): IVisualizationMeta {
        return {
            supportsExport: false,
            supportsZooming: false,
        };
    }
}
