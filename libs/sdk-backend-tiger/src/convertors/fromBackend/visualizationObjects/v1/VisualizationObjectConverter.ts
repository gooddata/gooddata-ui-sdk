// (C) 2019-2026 GoodData Corporation

import {
    type ITigerBucket,
    type ITigerSortItem,
    type VisualizationObjectModelV1,
} from "@gooddata/api-client-tiger";
import { type IBucket, type IInsightDefinition, type ISortItem } from "@gooddata/sdk-model";

import { convertTigerToSdkFilters } from "../../../shared/storedFilterConverter.js";
import { fixInsightLegacyElementUris } from "../../fixLegacyElementUris.js";
import { cloneWithSanitizedIdsTyped } from "../../IdSanitization.js";

/**
 * Converts Tiger-specific V1 visualization object to platform-agnostic insight definition.
 *
 * @deprecated V1 model is deprecated, use V2 converter instead
 * @param visualizationObject - Tiger V1 visualization object (uses ITigerBucket[], ITigerFilter[], etc.)
 * @returns Platform-agnostic insight definition (uses IBucket[], IFilter[], etc.)
 */
export function convertVisualizationObject(
    visualizationObject: VisualizationObjectModelV1.IVisualizationObject,
): IInsightDefinition {
    const convertedInsight: IInsightDefinition = {
        insight: {
            ...visualizationObject.visualizationObject,
            buckets:
                cloneWithSanitizedIdsTyped<ITigerBucket[], IBucket[]>(
                    visualizationObject.visualizationObject.buckets,
                ) ?? [],
            filters: convertTigerToSdkFilters(visualizationObject.visualizationObject.filters) ?? [],
            sorts:
                cloneWithSanitizedIdsTyped<ITigerSortItem[], ISortItem[]>(
                    visualizationObject.visualizationObject.sorts,
                ) ?? [],
        },
    };

    return fixInsightLegacyElementUris(convertedInsight);
}
