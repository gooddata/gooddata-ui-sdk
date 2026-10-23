// (C) 2021-2026 GoodData Corporation

import { type ReactElement, type ReactNode, createContext, useMemo } from "react";

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

import { useMetrics } from "../../../shared/metrics/useMetrics.js";
import { addPrefixToId } from "../../metric/prefixHelper.js";

export interface IOtherMetrics {
    otherMetrics: IMeasureMetadataObject[];
    loading: boolean;
}

export const OtherMetricsContext = createContext<IOtherMetrics>({
    otherMetrics: [],
    loading: false,
});

export function OtherMetricsProvider({
    defaultId,
    defaultPrefix,
    children,
}: {
    defaultId: string;
    defaultPrefix: string;
    children: ReactNode;
}): ReactElement {
    const otherMetrics = useItemsForExistenceChecking(defaultPrefix, defaultId);

    return <OtherMetricsContext.Provider value={otherMetrics}>{children}</OtherMetricsContext.Provider>;
}

function useItemsForExistenceChecking(defaultPrefix: string, defaultId: string): IOtherMetrics {
    const metricsResult = useMetrics();

    return useMemo(() => {
        const otherItemsList = metricsResult.result || [];

        return {
            otherMetrics: otherItemsList.filter(
                (value) => value.id !== addPrefixToId(defaultPrefix, defaultId),
            ),
            loading: metricsResult.status === "loading",
        };
    }, [defaultId, defaultPrefix, metricsResult]);
}
