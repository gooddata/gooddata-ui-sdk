// (C) 2019-2025 GoodData Corporation

import type { ComponentType } from "react";

import { type WrappedComponentProps } from "react-intl";

import { withEntireDataView } from "@gooddata/sdk-ui";
import { ThemeContextProvider, withTheme } from "@gooddata/sdk-ui-theme-provider";

import { type ICoreGeoChartProps } from "./geoChart/GeoChartInner.js";
import { GeoChartOptionsWrapper } from "./geoChart/GeoChartOptionsWrapper.js";
import { geoValidatorHOC } from "./geoChart/GeoValidatorHOC.js";
import { withMapboxToken } from "./MapboxTokenProvider.js";

const WrappedCoreGeoChart = withTheme(
    withMapboxToken(geoValidatorHOC(withEntireDataView(GeoChartOptionsWrapper) as any)),
) as ComponentType<any>;

/**
 * @internal
 */
export function CoreGeoChart(props: ICoreGeoChartProps & WrappedComponentProps) {
    return (
        <ThemeContextProvider theme={props.theme || {}} themeIsLoading={false}>
            <WrappedCoreGeoChart {...props} />
        </ThemeContextProvider>
    );
}
