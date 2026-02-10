// (C) 2019-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    type ITigerAttributeFilterConfigs,
    type ITigerBucket,
    type ITigerFilter,
    type ITigerInsightLayerDefinition,
    type ITigerSortItem,
    type ITigerVisualizationProperties,
} from "./TigerTypes.js";

/**
 * Visualization object used to store its data as a metadata object
 * @public
 */
export interface IVisualizationObject {
    version: "2";
    visualizationUrl: string;
    buckets: ITigerBucket[];
    filters: ITigerFilter[];
    attributeFilterConfigs?: ITigerAttributeFilterConfigs;
    sorts: ITigerSortItem[];
    properties: ITigerVisualizationProperties;
    layers?: ITigerInsightLayerDefinition[];
}

/**
 * @public
 */
export function isVisualizationObject(
    visualizationObject: unknown,
): visualizationObject is IVisualizationObject {
    return !isEmpty(visualizationObject) && (visualizationObject as IVisualizationObject).version === "2";
}
