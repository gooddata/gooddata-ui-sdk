// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import type { ScalarParameterType } from "@gooddata/sdk-model";

import { useFeatureFlag } from "../permission/PermissionsContext.js";

/** The flag gating catalog parameters, referenced by the gate below and
 *  `parameterDescriptor.featureFlag`. */
export const PARAMETER_FEATURE_FLAG = "enableParameters";

/**
 * Catalog parameter feature gate.
 */
export function useIsParametersEnabled(): boolean {
    return useFeatureFlag(PARAMETER_FEATURE_FLAG);
}

/**
 * Parameter types authorable in the catalog, gated by `enableStringParameters`.
 */
export function useEnabledParameterTypes(): ScalarParameterType[] {
    const enableStringParameters = useFeatureFlag("enableStringParameters");
    return useMemo<ScalarParameterType[]>(
        () => (enableStringParameters ? ["NUMBER", "STRING"] : ["NUMBER"]),
        [enableStringParameters],
    );
}
