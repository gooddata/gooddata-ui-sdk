// (C) 2020-2021 GoodData Corporation
import React, { Component } from "react";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { GeoPushpinChart, IGeoConfig } from "@gooddata/sdk-ui-geo";
import { locationAttribute, segmentByAttribute, sizeMeasure } from "../../md/geoModel";

export class GeoPushpinChartConfigurationLegendExample extends Component {
    public render(): React.ReactNode {
        const geoConfig: IGeoConfig = {
            mapboxToken: MAPBOX_TOKEN,
            legend: {
                position: "right", // could be "top", "right", "bottom" or "left"
            },
        };
        return (
            <div
                style={{ height: "500px", position: "relative" }}
                className="s-geo-pushpin-chart-configuration-legend"
            >
                <GeoPushpinChart
                    location={locationAttribute}
                    segmentBy={segmentByAttribute}
                    size={sizeMeasure}
                    config={geoConfig}
                    onError={this.onError}
                />
            </div>
        );
    }

    private onError(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationLegendExample onError", ...params);
    }
}

export default GeoPushpinChartConfigurationLegendExample;
