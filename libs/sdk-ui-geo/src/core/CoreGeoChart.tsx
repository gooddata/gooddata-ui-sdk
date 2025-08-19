// (C) 2019-2025 GoodData Corporation
import React from "react";

import compose from "lodash/flowRight.js";
import { WrappedComponentProps } from "react-intl";

import { withEntireDataView } from "@gooddata/sdk-ui";
import { ThemeContextProvider, withTheme } from "@gooddata/sdk-ui-theme-provider";

import { ICoreGeoChartProps } from "./geoChart/GeoChartInner.js";
import { GeoChartOptionsWrapper } from "./geoChart/GeoChartOptionsWrapper.js";
import { geoValidatorHOC } from "./geoChart/GeoValidatorHOC.js";
import { withMapboxToken } from "./MapboxTokenProvider.js";

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
