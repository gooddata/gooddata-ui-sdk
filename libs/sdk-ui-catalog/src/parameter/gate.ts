// (C) 2026 GoodData Corporation

import { useFeatureFlag } from "../permission/PermissionsContext.js";

/**
 * Catalog parameter feature gate.
 */
export function useIsParametersEnabled(): boolean {
    return useFeatureFlag("enableParameters");
}
