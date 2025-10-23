// (C) 2025 GoodData Corporation

import { ReactNode, createContext, useContext } from "react";

import { useDeepMemo } from "@gooddata/sdk-ui/internal";

import { EMPTY_DRILLS, EMPTY_FILTERS, EMPTY_OBJECT, EMPTY_SORT_BY } from "../constants/internal.js";
import { IGeoPushpinChartNextConfig } from "../types/config.js";
import { ICoreGeoPushpinChartNextProps } from "../types/internal.js";

const GeoPushpinPropsContext = createContext<ICoreGeoPushpinChartNextProps | undefined>(undefined);

/**
 * Provider for GeoPushpinChartNext component props.
 *
 * @remarks
 * This context provides access to all props passed to the GeoPushpinChartNext component
 * including configuration, data properties, and callback handlers.
 *
 * @alpha
 */
export function GeoPushpinPropsProvider({
    children,
    ...props
}: ICoreGeoPushpinChartNextProps & { children: ReactNode }) {
    return <GeoPushpinPropsContext.Provider value={props}>{children}</GeoPushpinPropsContext.Provider>;
}

type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

type ConfigDefaults = "points" | "legend";

type ConfigWithDefaults = WithRequired<IGeoPushpinChartNextConfig, ConfigDefaults>;

type RootPropsDefaults = "drillableItems" | "filters" | "sortBy" | "config" | "execConfig";

type RootPropsWithDefaults = WithRequired<ICoreGeoPushpinChartNextProps, RootPropsDefaults>;

type GeoPushpinPropsWithDefaults = RootPropsWithDefaults & {
    config: ConfigWithDefaults;
};

/**
 * Applies default values to GeoPushpinChartNext props.
 *
 * @param props - The component props
 * @returns Props with defaults applied
 *
 * @alpha
 */
export function applyGeoPushpinDefaultProps(
    props: ICoreGeoPushpinChartNextProps,
): GeoPushpinPropsWithDefaults {
    return {
        ...props,
        drillableItems: props.drillableItems ?? EMPTY_DRILLS,
        filters: props.filters ?? EMPTY_FILTERS,
        sortBy: props.sortBy ?? EMPTY_SORT_BY,
        config: {
            ...(props.config ?? {}),
            center: props.config?.center,
            zoom: props.config?.zoom,
            points: {
                ...(props.config?.points ?? {}),
                minSize: props.config?.points?.minSize ?? "normal",
                maxSize: props.config?.points?.maxSize ?? "normal",
                groupNearbyPoints: props.config?.points?.groupNearbyPoints ?? true,
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
 * Hook to access GeoPushpinChartNext component props.
 *
 * @remarks
 * This hook provides access to all component props with default values applied
 * and deep memoization for stable references across renders.
 *
 * @returns Component props with defaults
 * @throws Error if used outside of GeoPushpinPropsProvider
 *
 * @alpha
 */
export function useGeoPushpinProps(): GeoPushpinPropsWithDefaults {
    const context = useContext(GeoPushpinPropsContext);
    const memoizeDeep = useDeepMemo();

    if (context === undefined) {
        throw new Error("useGeoPushpinProps must be used within a GeoPushpinPropsProvider");
    }

    const baseProps = applyGeoPushpinDefaultProps(context);

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
