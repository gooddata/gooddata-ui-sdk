// (C) 2019-2022 GoodData Corporation
import React from "react";
import { withEntireDataView } from "@gooddata/sdk-ui";
import { ThemeContextProvider, withTheme } from "@gooddata/sdk-ui-theme-provider";
import { WrappedComponentProps } from "react-intl";
import { geoValidatorHOC } from "./geoChart/GeoValidatorHOC.js";
import { GeoChartOptionsWrapper } from "./geoChart/GeoChartOptionsWrapper.js";
import { ICoreGeoChartProps } from "./geoChart/GeoChartInner.js";
import { withMapboxToken } from "./MapboxTokenProvider.js";
import compose from "lodash/flowRight.js";

const WrappedCoreGeoChart = compose(
    withTheme,
    withMapboxToken,
    geoValidatorHOC,
    withEntireDataView,
)(GeoChartOptionsWrapper);

/**
 * @internal
 */
export const CoreGeoChart: React.FC<ICoreGeoChartProps & WrappedComponentProps> = (props) => (
    <ThemeContextProvider theme={props.theme || {}} themeIsLoading={false}>
        <WrappedCoreGeoChart {...props} />
    </ThemeContextProvider>
);
