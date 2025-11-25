// (C) 2025 GoodData Corporation

import { ReactNode, createContext, useContext } from "react";

import { useDeepMemo } from "@gooddata/sdk-ui/internal";

import { EMPTY_DRILLS, EMPTY_FILTERS, EMPTY_OBJECT, EMPTY_SORT_BY } from "../constants/internal.js";
import { resolveEffectiveAreaAttribute } from "../helpers/areaAttributeResolver.js";
import { IGeoAreaChartConfig } from "../types/areaConfig.js";
import { ICoreGeoAreaChartProps } from "../types/areaInternal.js";

const GeoAreaPropsContext = createContext<ICoreGeoAreaChartProps | undefined>(undefined);

/**
 * Provider for GeoAreaChart component props.
 *
 * @remarks
 * This context provides access to all props passed to the GeoAreaChart component
 * including configuration, data properties, and callback handlers.
 *
 * @alpha
 */
export function GeoAreaPropsProvider({
    children,
    ...props
}: ICoreGeoAreaChartProps & { children: ReactNode }) {
    return <GeoAreaPropsContext.Provider value={props}>{children}</GeoAreaPropsContext.Provider>;
}

type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

type ConfigDefaults = "areas" | "legend";

type ConfigWithDefaults = WithRequired<IGeoAreaChartConfig, ConfigDefaults>;

type RootPropsDefaults = "drillableItems" | "filters" | "sortBy" | "config" | "execConfig";

type RootPropsWithDefaults = WithRequired<ICoreGeoAreaChartProps, RootPropsDefaults>;

type GeoAreaPropsWithDefaults = RootPropsWithDefaults & {
    config: ConfigWithDefaults;
};

/**
 * Applies default values to GeoAreaChart props.
 *
 * @param props - The component props
 * @returns Props with defaults applied
 *
 * @alpha
 */
export function applyGeoAreaDefaultProps(props: ICoreGeoAreaChartProps): GeoAreaPropsWithDefaults {
    const area = resolveEffectiveAreaAttribute(props.area, props.execution?.definition);

    return {
        ...props,
        area,
        drillableItems: props.drillableItems ?? EMPTY_DRILLS,
        filters: props.filters ?? EMPTY_FILTERS,
        sortBy: props.sortBy ?? EMPTY_SORT_BY,
        config: {
            ...(props.config ?? {}),
            center: props.config?.center,
            zoom: props.config?.zoom,
            areas: {
                ...(props.config?.areas ?? {}),
                fillOpacity: props.config?.areas?.fillOpacity ?? 0.7,
                borderColor: props.config?.areas?.borderColor ?? "#FFFFFF",
                borderWidth: props.config?.areas?.borderWidth ?? 1,
            },
            legend: {
                ...(props.config?.legend ?? {}),
                enabled: props.config?.legend?.enabled ?? true,
                position: props.config?.legend?.position ?? "top",
            },
        },
        execConfig: props.execConfig ?? EMPTY_OBJECT,
    };
}

/**
 * Hook to access GeoAreaChart component props.
 *
 * @remarks
 * This hook provides access to all component props with default values applied
 * and deep memoization for stable references across renders.
 *
 * @returns Component props with defaults
 * @throws Error if used outside of GeoAreaPropsProvider
 *
 * @alpha
 */
export function useGeoAreaProps(): GeoAreaPropsWithDefaults {
    const context = useContext(GeoAreaPropsContext);
    const memoizeDeep = useDeepMemo();

    if (context === undefined) {
        throw new Error("useGeoAreaProps must be used within a GeoAreaPropsProvider");
    }

    const baseProps = applyGeoAreaDefaultProps(context);

    // Recursively memoize nested properties to maintain stable references
    return {
        ...baseProps,
        drillableItems: memoizeDeep("drillableItems", baseProps.drillableItems),
        filters: memoizeDeep("filters", baseProps.filters),
        sortBy: memoizeDeep("sortBy", baseProps.sortBy),
        execConfig: memoizeDeep("execConfig", baseProps.execConfig),
        config: memoizeDeep("config", baseProps.config),
    };
}
