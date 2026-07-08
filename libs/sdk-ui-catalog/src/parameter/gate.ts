// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import type { ParameterType } from "@gooddata/sdk-model";

import { useFeatureFlag, useWorkspacePermission } from "../permission/PermissionsContext.js";

/**
 * Catalog parameter feature gate.
 */
export function useIsParametersEnabled(): boolean {
    return useFeatureFlag("enableParameters");
}

/**
 * Whether the current user can manage parameters in the catalog.
 */
export function useCanManageParameter(): boolean {
    const isParametersEnabled = useIsParametersEnabled();
    const canManageProject = useWorkspacePermission("canManageProject");
    return isParametersEnabled && canManageProject;
}

/**
 * Parameter types authorable in the catalog, gated by `enableStringParameters`.
 */
export function useEnabledParameterTypes(): ParameterType[] {
    const enableStringParameters = useFeatureFlag("enableStringParameters");
    return useMemo<ParameterType[]>(
        () => (enableStringParameters ? ["NUMBER", "STRING"] : ["NUMBER"]),
        [enableStringParameters],
    );
}
