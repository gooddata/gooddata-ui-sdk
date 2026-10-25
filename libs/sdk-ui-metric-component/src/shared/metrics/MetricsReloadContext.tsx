// (C) 2021-2026 GoodData Corporation

import { type PropsWithChildren, createContext, useMemo, useState } from "react";

export interface IMetricsReloadContext {
    metricReloadRequest: string;
    needMetricReload: () => void;
}

export const MetricsReloadContext = createContext<IMetricsReloadContext | null>(null);

/**
 * @internal
 */
export function MetricsReloadContextProvider({ children }: PropsWithChildren) {
    const [metricReloadRequest, setMetricReloadRequest] = useState("init");

    const contextValue = useMemo<IMetricsReloadContext>((): IMetricsReloadContext => {
        return {
            metricReloadRequest,
            needMetricReload: () => setMetricReloadRequest(Math.random().toString()),
        };
    }, [metricReloadRequest]);

    return <MetricsReloadContext.Provider value={contextValue}>{children}</MetricsReloadContext.Provider>;
}
