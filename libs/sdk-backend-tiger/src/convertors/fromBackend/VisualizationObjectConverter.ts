// (C) 2019-2020 GoodData Corporation
import cloneDeepWith from "lodash/cloneDeepWith";
import { IInsightDefinition } from "@gooddata/sdk-model";
import { ExecuteAFM, VisualizationObject } from "@gooddata/api-client-tiger";

import { toObjRef } from "./afm/ObjRefConverter";

const cloneWithSanitizedIds = (item: any) =>
    cloneDeepWith(item, (value) => {
        if (ExecuteAFM.isObjIdentifierQualifier(value)) {
            return toObjRef(value);
        }

        return undefined;
    });

export const convertVisualizationObject = (
    visualizationObject: VisualizationObject.IVisualizationObject,
): IInsightDefinition => {
    return {
        insight: {
            ...visualizationObject.visualizationObject,
            buckets: cloneWithSanitizedIds(visualizationObject.visualizationObject.buckets),
            filters: cloneWithSanitizedIds(visualizationObject.visualizationObject.filters),
            sorts: cloneWithSanitizedIds(visualizationObject.visualizationObject.sorts),
        },
    };
};
