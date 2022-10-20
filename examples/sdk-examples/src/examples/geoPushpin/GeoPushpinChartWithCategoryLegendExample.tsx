// (C) 2020-2022 GoodData Corporation
import React from "react";
import { GeoPushpinChart } from "@gooddata/sdk-ui-geo";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { locationAttribute, sizeMeasure, colorMeasure, segmentByAttribute } from "../../md/geoModel";

export const GeoPushpinChartWithCategoryLegendExample: React.FC = () => {
    const onLoadingChanged = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartWithCategoryLegendExample onLoadingChanged", ...params);
    };

    const onError = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartWithCategoryLegendExample onError", ...params);
    };

    const onZoomChanged = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartWithCategoryLegendExample onZoomChanged", ...params);
    };

    const onCenterPositionChanged = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartWithCategoryLegendExample onCenterPositionChanged", ...params);
    };

    return (
        <div style={{ height: "500px", position: "relative" }} className="s-geo-pushpin-chart-category">
            <GeoPushpinChart
                location={locationAttribute}
                size={sizeMeasure}
                color={colorMeasure}
                segmentBy={segmentByAttribute}
                config={{
                    mapboxToken: MAPBOX_TOKEN,
                }}
                onZoomChanged={onZoomChanged}
                onCenterPositionChanged={onCenterPositionChanged}
                onLoadingChanged={onLoadingChanged}
                onError={onError}
            />
        </div>
    );
};

export default GeoPushpinChartWithCategoryLegendExample;
