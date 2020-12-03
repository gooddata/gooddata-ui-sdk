// (C) 2019-2020 GoodData Corporation
import cloneDeepWith from "lodash/cloneDeepWith";
import { IInsightDefinition } from "@gooddata/sdk-model";
import { VisualizationObject, isObjectIdentifier } from "@gooddata/api-client-tiger";

import { toObjRef } from "./afm/ObjRefConverter";

const cloneWithSanitizedIds = (item: any) =>
    cloneDeepWith(item, (value) => {
        if (isObjectIdentifier(value)) {
            return toObjRef(value);
        }

        return undefined;
    });

export const convertVisualizationObject = (
    title: string,
    visualizationObject: VisualizationObject.IVisualizationObject,
): IInsightDefinition => {
    return {
        insight: {
            title: title,
            visualizationUrl: visualizationObject.visualizationObject.visualizationUrl,
            buckets: cloneWithSanitizedIds(visualizationObject.visualizationObject.buckets),
            filters: cloneWithSanitizedIds(visualizationObject.visualizationObject.filters),
            sorts: cloneWithSanitizedIds(visualizationObject.visualizationObject.sorts),
            properties: visualizationObject.visualizationObject.properties,
        },
    };
};
