// (C) 2019-2020 GoodData Corporation
import cloneDeepWith from "lodash/cloneDeepWith";
import { IInsightDefinition, isIdentifierRef } from "@gooddata/sdk-model";
import { VisualizationObject } from "@gooddata/api-client-tiger";

import { toObjQualifier } from "./ObjRefConverter";

const cloneWithSanitizedIds = (item: any) =>
    cloneDeepWith(item, (value) => {
        if (isIdentifierRef(value)) {
            return toObjQualifier(value);
        }

        return undefined;
    });

export const convertInsight = (insight: IInsightDefinition): VisualizationObject.IVisualizationObject => {
    return {
        visualizationObject: {
            properties: insight.insight.properties,
            visualizationUrl: insight.insight.visualizationUrl,
            buckets: cloneWithSanitizedIds(insight.insight.buckets),
            filters: cloneWithSanitizedIds(insight.insight.filters),
            sorts: cloneWithSanitizedIds(insight.insight.sorts),
        },
    };
};
