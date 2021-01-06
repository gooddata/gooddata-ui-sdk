// (C) 2019-2020 GoodData Corporation
import { IInsightDefinition } from "@gooddata/sdk-model";
import { VisualizationObjectModel } from "@gooddata/api-client-tiger";
import { cloneWithSanitizedIds } from "./IdSanitization";

export const convertVisualizationObject = (
    visualizationObject: VisualizationObjectModel.IVisualizationObject,
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
