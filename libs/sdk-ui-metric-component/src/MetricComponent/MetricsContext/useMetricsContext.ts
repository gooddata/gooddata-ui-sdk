// (C) 2022-2026 GoodData Corporation

import { useContext } from "react";

import { type IMetricsContext, MetricsContext } from "./MetricsContext.js";

export function useMetricsContext(): IMetricsContext {
    return useContext(MetricsContext);
}
