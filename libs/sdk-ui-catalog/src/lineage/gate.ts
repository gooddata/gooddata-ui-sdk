// (C) 2026 GoodData Corporation

import { useFeatureFlag } from "../permission/PermissionsContext.js";

/**
 * Checks whether lineage is enabled.
 */
export function useIsLineageEnabled(): boolean {
    return useFeatureFlag("enableCatalogLineage");
}
