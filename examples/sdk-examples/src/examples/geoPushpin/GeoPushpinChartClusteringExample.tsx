// (C) 2020 GoodData Corporation
import React, { Component } from "react";
import { GeoPushpinChart } from "@gooddata/sdk-ui-geo";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { Ldm } from "../../ldm";

export class GeoPushpinChartClusteringExample extends Component {
    public render() {
        return (
            <div style={{ height: "500px", position: "relative" }} className="s-geo-pushpin-chart-clustering">
                <GeoPushpinChart
                    location={Ldm.City.Location}
                    config={{
                        mapboxToken: MAPBOX_TOKEN,
                    }}
                    onZoomChanged={this.onZoomChanged}
                    onCenterPositionChanged={this.onCenterPositionChanged}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }

    private onLoadingChanged(...params: any[]) {
        // tslint:disable-next-line:no-console
        return console.log("GeoPushpinChartClusteringExample onLoadingChanged", ...params);
    }

    private onError(...params: any[]) {
        // tslint:disable-next-line:no-console
        return console.log("GeoPushpinChartClusteringExample onError", ...params);
    }

    private onZoomChanged(...params: any[]) {
        // tslint:disable-next-line:no-console
        return console.log("GeoPushpinChartClusteringExample onZoomChanged", ...params);
    }

    private onCenterPositionChanged(...params: any[]) {
        // tslint:disable-next-line:no-console
        return console.log("GeoPushpinChartClusteringExample onCenterPositionChanged", ...params);
    }
}

export default GeoPushpinChartClusteringExample;
