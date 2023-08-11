// (C) 2023 GoodData Corporation
import { IVisualizationProperties } from "../interfaces/Visualization.js";
import { IDefaultControlProperties } from "../interfaces/ControlProperties.js";
import { IBucket, IFilter, IInsightDefinition, ISortItem } from "@gooddata/sdk-model";

export const createTestProperties = <T extends IDefaultControlProperties>(
    params: T,
): IVisualizationProperties<T> => {
    return {
        controls: {
            ...params,
        },
    };
};

export const newInsight = <ControlProperties = IDefaultControlProperties>(
    buckets: IBucket[],
    options?: {
        title?: string;
        visualizationUrl?: string;
        properties?: IVisualizationProperties<ControlProperties>;
        sorts?: ISortItem[];
        filters?: IFilter[];
    },
): IInsightDefinition => {
    return {
        insight: {
            title: options?.title || "Insight",
            sorts: options?.sorts || [],
            filters: options?.filters || [],
            visualizationUrl: options?.visualizationUrl || "local:visualization",
            properties: options?.properties || {},
            buckets,
        },
    };
};
