// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { IExecutionConfig, IFilter } from "@gooddata/sdk-model";

import { useEvaluatedMetricsAndAttributes } from "./useEvaluatedMetricsAndAttributes.js";
import { collectReferences } from "../helpers/references.js";

export function useEvaluatedReferences(
    value: string,
    filters: IFilter[],
    config: IExecutionConfig & { enabled: boolean; isFiltersLoading?: boolean },
) {
    const isEmptyValue = useMemo(() => !value?.replace(/\s/g, ""), [value]);
    const references = useMemo(() => collectReferences(value), [value]);

    const {
        loading,
        result: metrics,
        error: metricsError,
    } = useEvaluatedMetricsAndAttributes(references, filters, {
        ...config,
        // Mark filters as loaded when there are no references to resolve to speed up loading.
        // The query that sets this value runs no matter if there are references or not.
        isFiltersLoading: Object.keys(references).length > 0 && !!config.isFiltersLoading,
    });

    return {
        isEmptyValue,
        loading,
        metrics,
        error: metricsError,
    };
}
