// (C) 2019-2024 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import {
    IBucket,
    IFilter,
    IAttributeFilterConfigs,
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
}

/**
 * @public
 */
export function isVisualizationObject(
    visualizationObject: unknown,
): visualizationObject is IVisualizationObject {
    return !isEmpty(visualizationObject) && (visualizationObject as IVisualizationObject).version === "2";
}
