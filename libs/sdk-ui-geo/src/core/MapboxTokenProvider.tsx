// (C) 2021-2026 GoodData Corporation

import { type ComponentType, type ReactNode, createContext, useContext } from "react";

import { invariant } from "ts-invariant";

import { type IGeoConfig } from "../GeoChart.js";

/**
 * @public
 * @deprecated Kept only for the legacy Mapbox-based implementation.
 */
export const MapboxTokenContext = createContext<{ mapboxToken: string | undefined }>({
    mapboxToken: undefined,
});

/**
 * @public
 * @deprecated Kept only for the legacy Mapbox-based implementation.
 */
export function MapboxTokenProvider({ token, children }: { token: string; children?: ReactNode }) {
    return (
        <MapboxTokenContext.Provider value={{ mapboxToken: token }}>{children}</MapboxTokenContext.Provider>
    );
}

/**
 * @public
 * @deprecated Kept only for the legacy Mapbox-based implementation.
 */
export function withMapboxToken<T extends { config?: IGeoConfig }>(
    InnerComponent: ComponentType<T>,
): ComponentType<T> {
    function MapboxTokenHOC(props: T) {
        const { mapboxToken } = useContext(MapboxTokenContext);

        return (
            <>
                <InnerComponent {...props} config={enrichMapboxToken(props.config, mapboxToken)} />
            </>
        );
    }

    return MapboxTokenHOC;
}

/**
 * @public
 * @deprecated Kept only for the legacy Mapbox-based implementation.
 */
export function enrichMapboxToken<T>(
    config?: T & { mapboxToken?: string },
    mapboxToken?: string,
): (T & { mapboxToken?: string }) | undefined {
    return mapboxToken
        ? ({
              ...(config || {}),
              mapboxToken: config?.mapboxToken || mapboxToken,
          } as T & { mapboxToken?: string })
        : config;
}

/**
 * @public
 * @deprecated Kept only for the legacy Mapbox-based implementation.
 */
export function useMapboxTokenStrict(mapboxToken?: string) {
    const context = useContext(MapboxTokenContext);
    const token = mapboxToken ?? context.mapboxToken;
    invariant(token, "Mapbox token was not provided. Use <MapboxTokenProvider /> to provide token.");

    return token;
}

/**
 * @public
 * @deprecated Kept only for the legacy Mapbox-based implementation.
 */
export function useMapboxToken(mapboxToken?: string) {
    const context = useContext(MapboxTokenContext);

    return mapboxToken ?? context.mapboxToken;
}
