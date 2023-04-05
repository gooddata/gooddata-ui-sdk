// (C) 2021-2023 GoodData Corporation
import { IInsight } from "@gooddata/sdk-model";
import {
    IVisualizationDescriptor,
    IVisualizationMeta,
    PluggableVisualizationFactory,
} from "../../interfaces/VisualizationDescriptor";
import { BaseChartDescriptor } from "./baseChart/BaseChartDescriptor";
import { IDrillDownContext } from "../../interfaces/Visualization";
import { PluggableUnknownChart } from "./PluggableUnknownChart";

export class UnknownVisualizationDescriptor extends BaseChartDescriptor implements IVisualizationDescriptor {
    private uri: string;
    public constructor(uri: string) {
        super();
        this.uri = uri;
    }

    public getFactory(): PluggableVisualizationFactory {
        return (params) => new PluggableUnknownChart(params);
    }

    public applyDrillDown(
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
