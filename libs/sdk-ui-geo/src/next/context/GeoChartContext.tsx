// (C) 2025-2026 GoodData Corporation

import { type ReactNode, createContext, useContext } from "react";

import { useDeepMemo } from "@gooddata/sdk-ui/internal";

import { type IGeoChartResolvedProps } from "../types/props/geoChart/internal.js";

type IGeoChartContextProps = IGeoChartResolvedProps;

const GeoChartContext = createContext<IGeoChartContextProps | undefined>(undefined);

/**
 * Provider for GeoChart component props.
 *
 * @internal
 */
export function GeoChartPropsProvider({
    children,
    ...props
}: IGeoChartContextProps & { children: ReactNode }) {
    return <GeoChartContext.Provider value={props}>{children}</GeoChartContext.Provider>;
}

/**
 * Hook to access GeoChart component props.
 *
 * @remarks
 * Props are already resolved and defaulted in `useResolvedGeoChartProps`.
 *
 * @internal
 */
export function useGeoChartProps(): IGeoChartResolvedProps {
    const context = useContext(GeoChartContext);
    const memoizeDeep = useDeepMemo();

    if (context === undefined) {
        throw new Error("useGeoChartProps must be used within a GeoChartPropsProvider");
    }

    return {
        ...context,
        drillableItems: memoizeDeep("drillableItems", context.drillableItems),
        layers: memoizeDeep("layers", context.layers),
        execConfig: memoizeDeep("execConfig", context.execConfig),
        config: memoizeDeep("config", context.config),
    };
}
