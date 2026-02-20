// (C) 2026 GoodData Corporation

import type { ObjectType } from "../objectType/types.js";
import { useFeatureFlag } from "../permission/PermissionsContext.js";

const SUPPORTED_CERTIFICATION_TYPES: ObjectType[] = ["analyticalDashboard", "insight", "measure"];

/**
 * Catalog certification feature gate.
 */
export function useIsCatalogCertificationEnabled(): boolean {
    return useFeatureFlag("enableCertification");
}

/**
 * Catalog certification is supported only for selected object types.
 */
export function useIsCertificationAllowed(objectType?: ObjectType): boolean {
    const isCertificationEnabled = useIsCatalogCertificationEnabled();
    if (!isCertificationEnabled || !objectType) {
        return false;
    }
    return SUPPORTED_CERTIFICATION_TYPES.includes(objectType);
}
