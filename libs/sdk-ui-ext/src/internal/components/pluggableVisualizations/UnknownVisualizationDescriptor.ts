// (C) 2021-2025 GoodData Corporation

import { type IInsight } from "@gooddata/sdk-model";

import { BaseChartDescriptor } from "./baseChart/BaseChartDescriptor.js";
import { PluggableUnknownChart } from "./PluggableUnknownChart.js";
import { type IDrillDownContext } from "../../interfaces/Visualization.js";
import {
    type IVisualizationDescriptor,
    type IVisualizationMeta,
    type PluggableVisualizationFactory,
} from "../../interfaces/VisualizationDescriptor.js";

export class UnknownVisualizationDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    private uri: string;
    public constructor(uri: string) {
        super();
        this.uri = uri;
    }

    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableUnknownChart(params);
    }

    public override applyDrillDown(
        insight: IInsight,
        _drillDownContext: IDrillDownContext,
        _backendSupportsElementUris: boolean,
    ): IInsight {
        return insight;
    }

    public getEmbeddingCode = () => "";

    public getMeta(): IVisualizationMeta {
        return {
            documentationUrl: `unknown: ${this.uri}`,
            supportsExport: false,
            supportsZooming: false,
        };
    }
}
