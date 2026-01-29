// (C) 2025-2026 GoodData Corporation

import { type ReactElement } from "react";

import { IntlWrapper, UnexpectedSdkError } from "@gooddata/sdk-ui";
import { ThemeContextProvider } from "@gooddata/sdk-ui-theme-provider";

import { GeoChartDataLoader } from "./components/GeoChartDataLoader.js";
import { GeoChartPropsProvider } from "./context/GeoChartContext.js";
import { useNormalizedLayerExecutions } from "./hooks/dataLoading/useNormalizedLayerExecutions.js";
import { useLayersExecutions } from "./hooks/layers/useLayersExecutions.js";
import { useResolvedGeoChartProps } from "./hooks/props/useResolvedGeoChartProps.js";
import type { GeoLayerType } from "./types/layers/index.js";
import { type ICoreGeoChartProps } from "./types/props/geoChart/internal.js";
import { type IGeoChartProps } from "./types/props/geoChart/public.js";

/**
 * GeoChart renders a MapLibre-based geo visualization composed of one or more data layers.
 *
 * @public
 */
export function GeoChart(props: IGeoChartProps): ReactElement {
    const resolvedProps = useResolvedGeoChartProps(props);

    const { primaryExecution, additionalExecutions } = useLayersExecutions(resolvedProps);

    if (!primaryExecution) {
        throw new UnexpectedSdkError(
            "GeoChart requires at least one layer. " +
                "Provide layers=[{ id: 'myLayer', type: 'pushpin', latitude: Md.Lat, longitude: Md.Lng }] " +
                "for point data, or { id: 'myLayer', type: 'area', area: Md.Country } for region data.",
        );
    }

    return (
        <GeoChartInternal {...resolvedProps} execution={primaryExecution} executions={additionalExecutions} />
    );
}

/**
 * Internal implementation of GeoChart that consumes normalized layer executions.
 *
 * @internal
 */
export function GeoChartInternal(props: ICoreGeoChartProps & { type: GeoLayerType }): ReactElement {
    const { layerExecutions, propsWithLayers } = useNormalizedLayerExecutions(props);
    const { locale, theme, ...providerProps } = propsWithLayers;

    return (
        <IntlWrapper locale={locale}>
            <ThemeContextProvider theme={theme || {}} themeIsLoading={false}>
                <GeoChartPropsProvider {...providerProps} locale={locale} theme={theme}>
                    <GeoChartDataLoader layerExecutions={layerExecutions} />
                </GeoChartPropsProvider>
            </ThemeContextProvider>
        </IntlWrapper>
    );
}
