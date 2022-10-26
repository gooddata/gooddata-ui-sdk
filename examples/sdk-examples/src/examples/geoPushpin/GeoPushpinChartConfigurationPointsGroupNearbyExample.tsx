// (C) 2020-2022 GoodData Corporation
import React, { useState } from "react";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { CenterPositionChangedCallback, GeoPushpinChart, ZoomChangedCallback } from "@gooddata/sdk-ui-geo";
import { locationAttribute } from "../../md/geoModel";
import { OnError, OnLoadingChanged } from "@gooddata/sdk-ui";

export const GeoPushpinChartConfigurationPointsGroupNearbyExample: React.FC = () => {
    const [groupNearbyPoints, setGroupNearbyPoints] = useState<boolean>(false);

    const geoConfig = {
        mapboxToken: MAPBOX_TOKEN,
        points: {
            groupNearbyPoints,
        },
    };

    const toggleGroupNearbyPoints = () => {
        setGroupNearbyPoints((prevState) => !prevState);
    };

    const onLoadingChanged: OnLoadingChanged = () => {
        // handle the callback here
    };

    const onError: OnError = () => {
        // handle the callback here
    };

    const onZoomChanged: ZoomChangedCallback = () => {
        // handle the callback here
    };

    const onCenterPositionChanged: CenterPositionChangedCallback = () => {
        // handle the callback here
    };

    return (
        <div className="s-geo-chart">
            <button className="s-change-group-nearby-points" onClick={toggleGroupNearbyPoints}>
                Toggle Group nearby points
            </button>
            <div
                style={{ height: "500px", position: "relative" }}
                className="s-geo-pushpin-chart-configuration-points-group-nearby"
            >
                <GeoPushpinChart
                    location={locationAttribute}
                    config={geoConfig}
                    onZoomChanged={onZoomChanged}
                    onCenterPositionChanged={onCenterPositionChanged}
                    onLoadingChanged={onLoadingChanged}
                    onError={onError}
                />
            </div>
        </div>
    );
};

export default GeoPushpinChartConfigurationPointsGroupNearbyExample;
