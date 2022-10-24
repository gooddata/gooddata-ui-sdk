// (C) 2020-2022 GoodData Corporation
import React from "react";
import { CenterPositionChangedCallback, GeoPushpinChart, ZoomChangedCallback } from "@gooddata/sdk-ui-geo";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import * as Md from "../../md/full";
import { OnError, OnLoadingChanged } from "@gooddata/sdk-ui";
import noop from "lodash/noop";

export const GeoPushpinChartClusteringExample: React.FC = () => {
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
