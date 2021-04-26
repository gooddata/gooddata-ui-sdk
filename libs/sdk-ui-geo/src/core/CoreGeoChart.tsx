// (C) 2019-2020 GoodData Corporation
import React from "react";
import { withEntireDataView } from "@gooddata/sdk-ui";
import { ThemeContextProvider, withTheme } from "@gooddata/sdk-ui-theme-provider";
import { WrappedComponentProps } from "react-intl";
import { geoValidatorHOC } from "./geoChart/GeoValidatorHOC";
import { GeoChartOptionsWrapper } from "./geoChart/GeoChartOptionsWrapper";
import { ICoreGeoChartProps } from "./geoChart/GeoChartInner";

const WrappedCoreGeoChart = withTheme(geoValidatorHOC(withEntireDataView(GeoChartOptionsWrapper)));

/**
 * @internal
 */
export const CoreGeoChart: React.FC<ICoreGeoChartProps & WrappedComponentProps> = (props) => (
    <ThemeContextProvider theme={props.theme || {}} themeIsLoading={false}>
        <WrappedCoreGeoChart {...props} />
    </ThemeContextProvider>
);
