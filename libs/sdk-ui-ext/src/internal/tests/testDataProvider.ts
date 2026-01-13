// (C) 2023-2025 GoodData Corporation
import {
    type IBucket,
    type IFilter,
    type IInsightDefinition,
    type ISeparators,
    type ISortItem,
} from "@gooddata/sdk-model";
import { type IFormatPreset } from "@gooddata/sdk-ui-kit";

import { type IDefaultControlProperties } from "../interfaces/ControlProperties.js";
import { type IVisualizationProperties } from "../interfaces/Visualization.js";

export const TEST_DEFAULT_SEPARATOR: ISeparators = {
    decimal: ",",
    thousand: ".",
};

export const TEST_DECIMAL_FORMAT_PRESET: IFormatPreset = {
    name: "Decimal (1)",
    localIdentifier: "decimal-1",
    format: "#,##0.0",
    previewNumber: 1000.12,
};

export const TEST_PERCENT_ROUNDED_FORMAT_PRESET: IFormatPreset = {
    name: "Percent (rounded)",
    localIdentifier: "percent-rounded",
    format: "#,##0%",
    previewNumber: 0.1,
};

export const createTestProperties = <T extends IDefaultControlProperties>(
    params: T,
): IVisualizationProperties<T> => {
    return {
        controls: {
            ...params,
        },
    };
};

export const newInsight = <ControlProperties extends IDefaultControlProperties = IDefaultControlProperties>(
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
