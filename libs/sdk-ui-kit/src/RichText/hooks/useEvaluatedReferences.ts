// (C) 2025 GoodData Corporation
import { useMemo } from "react";
import { IExecutionConfig, IFilter } from "@gooddata/sdk-model";

import { collectReferences } from "../helpers/references.js";

import { useEvaluatedMetricsAndAttributes } from "./useEvaluatedMetricsAndAttributes.js";

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
    } = useEvaluatedMetricsAndAttributes(references, filters, config);

    return {
        isEmptyValue,
        loading,
        metrics,
        error: metricsError,
    };
}
