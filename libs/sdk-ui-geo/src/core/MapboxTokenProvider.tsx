// (C) 2021-2022 GoodData Corporation
import React, { useContext } from "react";
import { ICoreGeoChartProps } from "./geoChart/GeoChartInner";
import invariant from "ts-invariant";

/**
 * @alpha
 */
export const MapboxTokenContext = React.createContext<{ mapboxToken: string | undefined }>({
    mapboxToken: undefined,
});

/**
 * @alpha
 */
export const MapboxTokenProvider: React.FC<{ token: string }> = ({ token, children }) => {
    return (
        <MapboxTokenContext.Provider value={{ mapboxToken: token }}>{children}</MapboxTokenContext.Provider>
    );
};

/**
 * @internal
 */
export function withMapboxToken<T extends ICoreGeoChartProps>(
    InnerComponent: React.ComponentClass<T>,
): React.ComponentClass<T> {
    return class MapboxTokenHOC extends React.Component<T> {
        static contextType = MapboxTokenContext;
        declare context: React.ContextType<typeof MapboxTokenContext>;

        public render() {
            const { mapboxToken } = this.context;
            const props = this.props;
            const config = mapboxToken
                ? {
                      ...(props.config || {}),
                      mapboxToken: props.config?.mapboxToken || mapboxToken,
                  }
                : props.config;
            return (
                <>
                    <InnerComponent {...props} config={config} />
                </>
            );
        }
    };
}

/**
 * @alpha
 */
export function useMapboxToken() {
    const context = useContext(MapboxTokenContext);
    invariant(
        context.mapboxToken,
        "Mapbox token was not provided. Use <MapboxTokenProvider /> to provide token.",
    );

    return context.mapboxToken;
}
