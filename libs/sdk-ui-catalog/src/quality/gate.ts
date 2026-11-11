// (C) 2026 GoodData Corporation

import { ObjectTypes } from "../objectType/constants.js";
import type { ObjectType } from "../objectType/types.js";
import { useFeatureFlag, useWorkspacePermission } from "../permission/PermissionsContext.js";

const UNSUPPORTED_QUALITY_TYPES: ObjectType[] = [ObjectTypes.DOCUMENT];

/**
 * Whether the quality report covers objects of this type. Objects of other types never have issues.
 */
export function isQualityReported(objectType: ObjectType): boolean {
    return !UNSUPPORTED_QUALITY_TYPES.includes(objectType);
}

/**
 * Catalog Semantic Quality feature gate.
 *
 * Enabled only when the feature flag is on and the current user has AI Assistant permission.
 */
export function useIsCatalogQualityEnabled(): boolean {
    const isEnabledByFeatureFlag = useFeatureFlag("enableGenAICatalogQualityChecker");
    const canUseAiAssistant = useWorkspacePermission("canUseAiAssistant");

    return isEnabledByFeatureFlag && canUseAiAssistant;
}

/**
 * Catalog AI Description Generation feature gate.
 *
 * Enabled only when catalog quality checker is enabled and the current user has AI Assistant permission.
 */
export function useIsCatalogDescriptionGenerationEnabled(): boolean {
    return useIsCatalogQualityEnabled();
}

/**
 * Catalog Semantic Quality is not reported for every object type.
 */
export function useIsCatalogQualityAllowed(objectType?: ObjectType): boolean {
    const isQualityEnabled = useIsCatalogQualityEnabled();
    if (!isQualityEnabled || !objectType) {
        return false;
    }
    return isQualityReported(objectType);
}
