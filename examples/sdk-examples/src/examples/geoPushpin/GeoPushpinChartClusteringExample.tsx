// (C) 2020-2022 GoodData Corporation
import React from "react";
import { GeoPushpinChart } from "@gooddata/sdk-ui-geo";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import * as Md from "../../md/full";

export const GeoPushpinChartClusteringExample: React.FC = () => {
    const onLoadingChanged = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartClusteringExample onLoadingChanged", ...params);
    };

    const onError = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartClusteringExample onError", ...params);
    };

    const onZoomChanged = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartClusteringExample onZoomChanged", ...params);
    };

    const onCenterPositionChanged = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartClusteringExample onCenterPositionChanged", ...params);
    };

    return (
        <div style={{ height: "500px", position: "relative" }} className="s-geo-pushpin-chart-clustering">
            <GeoPushpinChart
                location={Md.City.Location}
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

export default GeoPushpinChartClusteringExample;
