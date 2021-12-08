// (C) 2020-2021 GoodData Corporation
import React, { Component } from "react";
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

export class GeoPushpinChartConfigurationExample extends Component {
    public render(): React.ReactNode {
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
            <div
                style={{ height: "500px", position: "relative" }}
                className="s-geo-pushpin-chart-configuration"
            >
                <GeoPushpinChart
                    location={locationAttribute}
                    size={sizeMeasure}
                    color={colorMeasure}
                    segmentBy={segmentByAttribute}
                    config={geoConfig}
                    onZoomChanged={this.onZoomChanged}
                    onCenterPositionChanged={this.onCenterPositionChanged}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }

    private onLoadingChanged(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationExample onLoadingChanged", ...params);
    }

    private onError(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationExample onError", ...params);
    }

    private onZoomChanged(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationExample onZoomChanged", ...params);
    }

    private onCenterPositionChanged(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationExample onCenterPositionChanged", ...params);
    }
}

export default GeoPushpinChartConfigurationExample;
