// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import type { ParameterType } from "@gooddata/sdk-model";

import { useCanManageAsCode } from "../asCode/gate.js";
import { useFeatureFlag } from "../permission/PermissionsContext.js";

/** The flag gating catalog parameters. The single source of truth, referenced by the gates below and
 *  `parameterDescriptor.featureFlag`. */
export const PARAMETER_FEATURE_FLAG = "enableParameters";

/**
 * Catalog parameter feature gate.
 */
export function useIsParametersEnabled(): boolean {
    return useFeatureFlag(PARAMETER_FEATURE_FLAG);
}

/**
 * Whether the current user can manage parameters in the catalog.
 */
export function useCanManageParameter(): boolean {
    return useCanManageAsCode(PARAMETER_FEATURE_FLAG);
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
