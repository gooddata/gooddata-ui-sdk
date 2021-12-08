// (C) 2020-2021 GoodData Corporation
import React, { Component } from "react";
import { GeoPushpinChart } from "@gooddata/sdk-ui-geo";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { locationAttribute, sizeMeasure, colorMeasure, segmentByAttribute } from "../../md/geoModel";

export class GeoPushpinChartWithCategoryLegendExample extends Component {
    public render(): React.ReactNode {
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
        return console.log("GeoPushpinChartWithCategoryLegendExample onLoadingChanged", ...params);
    }

    private onError(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartWithCategoryLegendExample onError", ...params);
    }

    private onZoomChanged(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartWithCategoryLegendExample onZoomChanged", ...params);
    }

    private onCenterPositionChanged(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartWithCategoryLegendExample onCenterPositionChanged", ...params);
    }
}

export default GeoPushpinChartWithCategoryLegendExample;
