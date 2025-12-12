// (C) 2025 GoodData Corporation

import { type ReactNode, createContext, useContext } from "react";

import { useDeepMemo } from "@gooddata/sdk-ui/internal";

import { type IGeoChartNextResolvedProps } from "../types/props/geoChartNext/internal.js";

type IGeoChartNextContextProps = IGeoChartNextResolvedProps;

const GeoChartNextContext = createContext<IGeoChartNextContextProps | undefined>(undefined);

/**
 * Provider for GeoChartNext component props.
 *
 * @remarks
 * This context provides access to all props passed to the GeoChartNext component
 * including configuration, data properties, and callback handlers.
 *
 * @internal
 */
export function GeoChartNextPropsProvider({
    children,
    ...props
}: IGeoChartNextContextProps & { children: ReactNode }) {
    return <GeoChartNextContext.Provider value={props}>{children}</GeoChartNextContext.Provider>;
}

/**
 * Hook to access GeoChartNext component props.
 *
 * @remarks
 * Props are already resolved and defaulted in `useResolvedGeoChartNextProps`.
 * We deep-memoize nested values to maintain stable references.
 *
 * @returns Component props
 * @throws Error if used outside of GeoChartNextPropsProvider
 *
 * @internal
 */
export function useGeoChartNextProps(): IGeoChartNextResolvedProps {
    const context = useContext(GeoChartNextContext);
    const memoizeDeep = useDeepMemo();

    if (context === undefined) {
        throw new Error("useGeoChartNextProps must be used within a GeoChartNextPropsProvider");
    }

    return {
        ...context,
        drillableItems: memoizeDeep("drillableItems", context.drillableItems),
        layers: memoizeDeep("layers", context.layers),
        execConfig: memoizeDeep("execConfig", context.execConfig),
        config: memoizeDeep("config", context.config),
    };
}
