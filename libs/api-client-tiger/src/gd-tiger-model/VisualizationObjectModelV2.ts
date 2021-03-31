// (C) 2019-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { IBucket, IFilter, ISortItem, VisualizationProperties } from "@gooddata/sdk-model";

export namespace VisualizationObjectModelV2 {
    /**
     * Visualization object used to store its data as a metadata object
     */
    export interface IVisualizationObject {
        version: "2";
        visualizationUrl: string;
        buckets: IBucket[];
        filters: IFilter[];
        sorts: ISortItem[];
        properties: VisualizationProperties;
    }

    export function isVisualizationObject(
        visualizationObject: unknown,
    ): visualizationObject is IVisualizationObject {
        return !isEmpty(visualizationObject) && (visualizationObject as IVisualizationObject).version === "2";
    }
}
