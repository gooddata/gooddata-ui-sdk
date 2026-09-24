// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { type IExecutionConfig, type IFilter, type ObjRef } from "@gooddata/sdk-model";

import { collectReferences, excludeReferences } from "../helpers/references.js";

import { useEvaluatedMetricsAndAttributes } from "./useEvaluatedMetricsAndAttributes.js";

/** A stable default, so a caller that has nothing restricted does not churn the memo below. */
const NO_RESTRICTED_REFERENCES: ObjRef[] = [];

export function useEvaluatedReferences(
    value: string,
    filters: IFilter[],
    config: IExecutionConfig & { enabled: boolean; isExecutionInputLoading?: boolean },
    restrictedReferences: ObjRef[] = NO_RESTRICTED_REFERENCES,
) {
    const isEmptyValue = useMemo(() => !value?.replace(/\s/g, ""), [value]);
    const references = useMemo(
        () => excludeReferences(collectReferences(value), restrictedReferences),
        [value, restrictedReferences],
    );

    const {
        loading,
        result: metrics,
        error: metricsError,
    } = useEvaluatedMetricsAndAttributes(references, filters, config);

    return {
        isEmptyValue,
        loading,
        metrics,
        error: metricsError,
    };
}
