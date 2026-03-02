// (C) 2026 GoodData Corporation

import { useFeatureFlag } from "../permission/PermissionsContext.js";

export function useIsCatalogTrendingObjectsEnabled(): boolean {
    return useFeatureFlag("enableCatalogTrendingObjects");
}
