// (C) 2025 GoodData Corporation

import { type ReactElement } from "react";

import { IntlWrapper, UnexpectedSdkError } from "@gooddata/sdk-ui";
import { ThemeContextProvider } from "@gooddata/sdk-ui-theme-provider";

import { GeoChartNextDataLoader } from "./components/GeoChartNextDataLoader.js";
import { GeoChartNextPropsProvider } from "./context/GeoChartNextContext.js";
import { useNormalizedLayerExecutions } from "./hooks/dataLoading/useNormalizedLayerExecutions.js";
import { useLayersExecutions } from "./hooks/layers/useLayersExecutions.js";
import { useResolvedGeoChartNextProps } from "./hooks/props/useResolvedGeoChartNextProps.js";
import type { GeoLayerType } from "./types/layers/index.js";
import { type ICoreGeoChartNextProps } from "./types/props/geoChartNext/internal.js";
import { type IGeoChartNextProps } from "./types/props/geoChartNext/public.js";

/**
 * GeoChartNext renders a MapLibre-based geo visualization composed of one or more data layers.
 *
 * @alpha
 */
export function GeoChartNext(props: IGeoChartNextProps): ReactElement {
    const resolvedProps = useResolvedGeoChartNextProps(props);

    const { primaryExecution, additionalExecutions } = useLayersExecutions(resolvedProps);

    if (!primaryExecution) {
        throw new UnexpectedSdkError(
            "GeoChartNext requires at least one layer. " +
                "Provide layers=[{ id: 'myLayer', type: 'pushpin', latitude: Md.Lat, longitude: Md.Lng }] " +
                "for point data, or { id: 'myLayer', type: 'area', area: Md.Country } for region data.",
        );
    }

    return (
        <GeoChartNextInternal
            {...resolvedProps}
            execution={primaryExecution}
            executions={additionalExecutions}
        />
    );
}

/**
 * Internal implementation of GeoChartNext that consumes normalized layer executions.
 *
 * @internal
 */
export function GeoChartNextInternal(props: ICoreGeoChartNextProps & { type: GeoLayerType }): ReactElement {
    const { layerExecutions, propsWithLayers } = useNormalizedLayerExecutions(props);
    const { locale, theme, ...providerProps } = propsWithLayers;

    return (
        <IntlWrapper locale={locale}>
            <ThemeContextProvider theme={theme || {}} themeIsLoading={false}>
                <GeoChartNextPropsProvider {...providerProps} locale={locale} theme={theme}>
                    <GeoChartNextDataLoader layerExecutions={layerExecutions} />
                </GeoChartNextPropsProvider>
            </ThemeContextProvider>
        </IntlWrapper>
    );
}
