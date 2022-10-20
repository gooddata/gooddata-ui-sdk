// (C) 2020-2022 GoodData Corporation
import React, { useState } from "react";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { GeoPushpinChart } from "@gooddata/sdk-ui-geo";
import { locationAttribute } from "../../md/geoModel";

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

    const onLoadingChanged = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log(
            "GeoPushpinChartConfigurationPointsGroupNearbyExample onLoadingChanged",
            ...params,
        );
    };

    const onError = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationPointsGroupNearbyExample onError", ...params);
    };

    const onZoomChanged = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationPointsGroupNearbyExample onZoomChanged", ...params);
    };

    const onCenterPositionChanged = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log(
            "GeoPushpinChartConfigurationPointsGroupNearbyExample onCenterPositionChanged",
            ...params,
        );
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
