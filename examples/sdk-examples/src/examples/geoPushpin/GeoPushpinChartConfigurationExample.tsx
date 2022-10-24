// (C) 2020-2022 GoodData Corporation
import React from "react";
import { CenterPositionChangedCallback, GeoPushpinChart, ZoomChangedCallback } from "@gooddata/sdk-ui-geo";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import {
    tooltipTextAttribute,
    locationAttribute,
    sizeMeasure,
    colorMeasure,
    segmentByAttribute,
} from "../../md/geoModel";
import { OnError, OnLoadingChanged } from "@gooddata/sdk-ui";
import noop from "lodash/noop";

const GEO_CHART_CONFIG = {
    center: {
        lat: 39,
        lng: -80.5,
    },
    zoom: 6,
    tooltipText: tooltipTextAttribute,
    mapboxToken: MAPBOX_TOKEN,
};

export const GeoPushpinChartConfigurationExample: React.FC = () => {
    const onLoadingChanged: OnLoadingChanged = (_params) => {
        // handle the callback here
        return noop;
    };

    const onError: OnError = (_params) => {
        // handle the callback here
        return noop;
    };

    const onZoomChanged: ZoomChangedCallback = (_params) => {
        // handle the callback here
        return noop;
    };

    const onCenterPositionChanged: CenterPositionChangedCallback = (_params) => {
        // handle the callback here
        return noop;
    };

    return (
        <div style={{ height: "500px", position: "relative" }} className="s-geo-pushpin-chart-configuration">
            <GeoPushpinChart
                location={locationAttribute}
                size={sizeMeasure}
                color={colorMeasure}
                segmentBy={segmentByAttribute}
                config={GEO_CHART_CONFIG}
                onZoomChanged={onZoomChanged}
                onCenterPositionChanged={onCenterPositionChanged}
                onLoadingChanged={onLoadingChanged}
                onError={onError}
            />
        </div>
    );
};

export default GeoPushpinChartConfigurationExample;
