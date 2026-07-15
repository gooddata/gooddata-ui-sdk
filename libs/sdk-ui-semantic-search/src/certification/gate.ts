// (C) 2026 GoodData Corporation

import { useFeatureFlag } from "../permissions/PermissionsContext.js";

/**
 * Search certification feature gate.
 * Mirrors the catalog's enableCertification feature flag.
 */
export function useIsSearchCertificationEnabled(): boolean {
    return useFeatureFlag("enableCertification");
}
