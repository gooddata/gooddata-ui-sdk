// (C) 2020-2022 GoodData Corporation
import React from "react";
import { GeoPushpinChart } from "@gooddata/sdk-ui-geo";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import {
    tooltipTextAttribute,
    locationAttribute,
    sizeMeasure,
    colorMeasure,
    segmentByAttribute,
} from "../../md/geoModel";

export const GeoPushpinChartConfigurationExample: React.FC = () => {
    const onLoadingChanged = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationExample onLoadingChanged", ...params);
    };

    const onError = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationExample onError", ...params);
    };

    const onZoomChanged = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationExample onZoomChanged", ...params);
    };

    const onCenterPositionChanged = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationExample onCenterPositionChanged", ...params);
    };

    const geoConfig = {
        center: {
            lat: 39,
            lng: -80.5,
        },
        zoom: 6,
        tooltipText: tooltipTextAttribute,
        mapboxToken: MAPBOX_TOKEN,
    };

    return (
        <div style={{ height: "500px", position: "relative" }} className="s-geo-pushpin-chart-configuration">
            <GeoPushpinChart
                location={locationAttribute}
                size={sizeMeasure}
                color={colorMeasure}
                segmentBy={segmentByAttribute}
                config={geoConfig}
                onZoomChanged={onZoomChanged}
                onCenterPositionChanged={onCenterPositionChanged}
                onLoadingChanged={onLoadingChanged}
                onError={onError}
            />
        </div>
    );
};

export default GeoPushpinChartConfigurationExample;
