// (C) 2021-2025 GoodData Corporation
import { ComponentType, createContext, ReactElement, ReactNode, useContext } from "react";
import { invariant } from "ts-invariant";
import { IGeoConfig } from "../GeoChart.js";

/**
 * @alpha
 */
export const MapboxTokenContext = createContext<{ mapboxToken: string | undefined }>({
    mapboxToken: undefined,
});

/**
 * @alpha
 */
export function MapboxTokenProvider({ token, children }: { token: string; children?: ReactNode }) {
    return (
        <MapboxTokenContext.Provider value={{ mapboxToken: token }}>{children}</MapboxTokenContext.Provider>
    );
}

/**
 * @internal
 */
export function withMapboxToken<T extends { config?: IGeoConfig }>(
    InnerComponent: ComponentType<T>,
): ComponentType<T> {
    function MapboxTokenHOC(props: T): ReactElement {
        const { mapboxToken } = useContext(MapboxTokenContext);
        const enrichedConfig = enrichMapboxToken(props.config, mapboxToken);

        return <InnerComponent {...props} config={enrichedConfig} />;
    }

    return MapboxTokenHOC;
}

/**
 * @internal
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
 * @alpha
 */
export function useMapboxTokenStrict(mapboxToken?: string) {
    const context = useContext(MapboxTokenContext);
    const token = mapboxToken ?? context.mapboxToken;
    invariant(token, "Mapbox token was not provided. Use <MapboxTokenProvider /> to provide token.");

    return token;
}

/**
 * @alpha
 */
export function useMapboxToken(mapboxToken?: string) {
    const context = useContext(MapboxTokenContext);

    return mapboxToken ?? context.mapboxToken;
}
