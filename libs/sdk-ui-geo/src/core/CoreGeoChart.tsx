// (C) 2019-2020 GoodData Corporation
import { geoValidatorHOC } from "./geoChart/GeoValidatorHOC";
import { withEntireDataView } from "@gooddata/sdk-ui";
import { GeoChartOptionsWrapper } from "./geoChart/GeoChartOptionsWrapper";

export const CoreGeoChart = geoValidatorHOC(withEntireDataView(GeoChartOptionsWrapper));
