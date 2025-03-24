// (C) 2025 GoodData Corporation
import { useMemo } from "react";
import { IFilter } from "@gooddata/sdk-model";

import { collectReferences } from "../helpers/references.js";

import { useEvaluatedMetricsAndAttributes } from "./useEvaluatedMetricsAndAttributes.js";

export function useEvaluatedReferences(value: string, filters: IFilter[], enabled: boolean) {
    const isEmptyValue = useMemo(() => !value?.replace(/\s/g, ""), [value]);
    const references = useMemo(() => collectReferences(value), [value]);

    const {
        loading,
        result: metrics,
        error: metricsError,
    } = useEvaluatedMetricsAndAttributes(references, filters, enabled);

    return {
        isEmptyValue,
        loading,
        metrics,
        error: metricsError,
    };
}
