// (C) 2019-2025 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    IAttributeFilterConfigs,
    IBucket,
    IFilter,
    IInsightLayerDefinition,
    ISortItem,
    VisualizationProperties,
} from "@gooddata/sdk-model";

/**
 * Visualization object used to store its data as a metadata object
 * @public
 */
export interface IVisualizationObject {
    version: "2";
    visualizationUrl: string;
    buckets: IBucket[];
    filters: IFilter[];
    attributeFilterConfigs?: IAttributeFilterConfigs;
    sorts: ISortItem[];
    properties: VisualizationProperties;
    layers?: IInsightLayerDefinition[];
}

/**
 * @public
 */
export function isVisualizationObject(
    visualizationObject: unknown,
): visualizationObject is IVisualizationObject {
    return !isEmpty(visualizationObject) && (visualizationObject as IVisualizationObject).version === "2";
}
