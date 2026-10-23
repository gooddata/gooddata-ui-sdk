// (C) 2022-2026 GoodData Corporation

import { type PropsWithChildren, createContext } from "react";

export enum MetricContextMode {
    Single = "single",
    Multiple = "multiple",
}

export interface IMetricsContext {
    mode: MetricContextMode;
}

export const MetricsContext = createContext<IMetricsContext>({
    mode: MetricContextMode.Single,
});

export function MetricsContextProvider({ children, ...metricContext }: PropsWithChildren<IMetricsContext>) {
    return <MetricsContext.Provider value={metricContext}>{children}</MetricsContext.Provider>;
}
