// (C) 2026 GoodData Corporation

import { useFeatureFlag, useWorkspacePermission } from "../permission/PermissionsContext.js";

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
