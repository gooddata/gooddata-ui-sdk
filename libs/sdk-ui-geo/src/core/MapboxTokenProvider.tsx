// (C) 2021-2022 GoodData Corporation
import React, { useContext } from "react";
import { invariant } from "ts-invariant";
import { IGeoConfig } from "../GeoChart.js";

/**
 * @alpha
 */
export const MapboxTokenContext = React.createContext<{ mapboxToken: string | undefined }>({
    mapboxToken: undefined,
});

/**
 * @alpha
 */
export const MapboxTokenProvider: React.FC<{ token: string; children?: React.ReactNode }> = ({
    token,
    children,
}) => {
    return (
        <MapboxTokenContext.Provider value={{ mapboxToken: token }}>{children}</MapboxTokenContext.Provider>
    );
};

/**
 * @internal
 */
export function withMapboxToken<T extends { config?: IGeoConfig }>(
    InnerComponent: React.ComponentType<T>,
): React.ComponentType<T> {
    return class MapboxTokenHOC extends React.Component<T> {
        static contextType = MapboxTokenContext;
        declare context: React.ContextType<typeof MapboxTokenContext>;

        public render() {
            const { mapboxToken } = this.context;
            const props = this.props;

            return (
                <>
                    <InnerComponent {...props} config={enrichMapboxToken(props.config, mapboxToken)} />
                </>
            );
        }
    };
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
