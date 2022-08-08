// (C) 2019-2022 GoodData Corporation
import React from "react";
import { withEntireDataView } from "@gooddata/sdk-ui";
import { ThemeContextProvider, withTheme } from "@gooddata/sdk-ui-theme-provider";
import { WrappedComponentProps } from "react-intl";
import { geoValidatorHOC } from "./geoChart/GeoValidatorHOC";
import { GeoChartOptionsWrapper } from "./geoChart/GeoChartOptionsWrapper";
import { ICoreGeoChartProps } from "./geoChart/GeoChartInner";
import { withMapboxToken } from "./MapboxTokenProvider";
import compose from "lodash/flowRight";

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
