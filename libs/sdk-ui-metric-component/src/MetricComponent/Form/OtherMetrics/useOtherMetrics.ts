// (C) 2021-2026 GoodData Corporation

import { useContext } from "react";

import { type IOtherMetrics, OtherMetricsContext } from "./OtherMetricsContext.js";

export function useOtherMetrics(): IOtherMetrics {
    return useContext(OtherMetricsContext);
}
