// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { GeoPushpinChart } from "@gooddata/sdk-ui-geo";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { locationAttribute, sizeMeasure, colorMeasure } from "../../ldm/geoModel";

export class GeoPushpinChartWithColorLegendExample extends Component {
    public render() {
        return (
            <div style={{ height: "500px", position: "relative" }} className="s-geo-pushpin-chart-color">
                <GeoPushpinChart
                    location={locationAttribute}
                    size={sizeMeasure}
                    color={colorMeasure}
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
        return console.log("GeoPushpinChartWithColorLegendExample onLoadingChanged", ...params);
    }

    private onError(...params: any[]) {
        // tslint:disable-next-line:no-console
        return console.log("GeoPushpinChartWithColorLegendExample onError", ...params);
    }

    private onZoomChanged(...params: any[]) {
        // tslint:disable-next-line:no-console
        return console.log("GeoPushpinChartWithColorLegendExample onZoomChanged", ...params);
    }

    private onCenterPositionChanged(...params: any[]) {
        // tslint:disable-next-line:no-console
        return console.log("GeoPushpinChartWithColorLegendExample onCenterPositionChanged", ...params);
    }
}

export default GeoPushpinChartWithColorLegendExample;
