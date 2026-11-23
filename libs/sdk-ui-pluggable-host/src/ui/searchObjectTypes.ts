// (C) 2026 GoodData Corporation

import { type GenAIObjectType } from "@gooddata/sdk-model";
import { type IEffectiveSettings } from "@gooddata/sdk-pluggable-application-model";

/**
 * Whether the header search may return Reports documents. Uses the same flags as the Analytics Catalog.
 */
export function canSearchDocuments(settings: IEffectiveSettings): boolean {
    return Boolean(settings.enableBusinessBriefingReportsApp && settings.enablePublisherV2);
}

export interface ISearchObjectTypesOptions {
    canManage: boolean;
    includeDocuments: boolean;
}

/**
 * The object types the header search asks semantic search for.
 */
export function getSearchObjectTypes({
    canManage,
    includeDocuments,
}: ISearchObjectTypesOptions): GenAIObjectType[] {
    const types: GenAIObjectType[] = ["dashboard", "visualization"];

    if (canManage) {
        types.push("metric");
    }

    if (includeDocuments) {
        types.push("document");
    }

    return types;
}
