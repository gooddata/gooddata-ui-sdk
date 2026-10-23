// (C) 2021-2026 GoodData Corporation

import { useContext } from "react";

import { type IMetricsReloadContext, MetricsReloadContext } from "./MetricsReloadContext.js";

export function useReloadMetrics(): IMetricsReloadContext {
    const reloadContext = useContext(MetricsReloadContext);
    if (!reloadContext) {
        throw new Error("useReloadMetrics must be used inside MetricsReloadContextProvider");
    }

    return reloadContext;
}
