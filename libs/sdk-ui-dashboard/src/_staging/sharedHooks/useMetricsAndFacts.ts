// (C) 2024 GoodData Corporation

import { useEffect, useMemo } from "react";

import {
    queryMetricsAndFacts,
    QueryMetricsAndFacts,
    IMetricsAndFacts,
    useDashboardQueryProcessing,
} from "../../model/index.js";

/**
 * @internal
 */
export function useMetricsAndFacts() {
    const {
        run: getMetricsAndFacts,
        result: metricsAndFacts,
        status: metricsAndFactsLoadingStatus,
        error: metricsAndFactsLoadingError,
    } = useDashboardQueryProcessing<
        QueryMetricsAndFacts,
        IMetricsAndFacts,
        Parameters<typeof queryMetricsAndFacts>
    >({
        queryCreator: queryMetricsAndFacts,
    });

    useEffect(() => {
        getMetricsAndFacts();
    }, [getMetricsAndFacts]);

    const metricsAndFactsLoading = useMemo(() => {
        return metricsAndFactsLoadingStatus === "pending" || metricsAndFactsLoadingStatus === "running";
    }, [metricsAndFactsLoadingStatus]);

    return {
        metricsAndFacts,
        metricsAndFactsLoading,
        metricsAndFactsLoadingError,
    };
}
