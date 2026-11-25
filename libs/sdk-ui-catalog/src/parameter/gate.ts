// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import type { ParameterType } from "@gooddata/sdk-model";

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

/** Gate of date range parameters: authoring them in the catalog and showing their period. */
export function useIsDateRangeParametersEnabled(): boolean {
    return useFeatureFlag("enableDateRangeParameters");
}

/** Parameter types authorable in the catalog, each behind its feature flag. */
export function useEnabledParameterTypes(): ParameterType[] {
    const enableStringParameters = useFeatureFlag("enableStringParameters");
    const enableDateRangeParameters = useIsDateRangeParametersEnabled();
    return useMemo<ParameterType[]>(
        () => [
            "NUMBER",
            ...(enableStringParameters ? ["STRING" as const] : []),
            ...(enableDateRangeParameters ? ["DATE_RANGE" as const] : []),
        ],
        [enableStringParameters, enableDateRangeParameters],
    );
}
