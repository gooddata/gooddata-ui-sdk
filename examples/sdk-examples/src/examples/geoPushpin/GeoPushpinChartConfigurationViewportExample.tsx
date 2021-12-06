// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { GeoPushpinChart } from "@gooddata/sdk-ui-geo";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { locationAttribute } from "../../md/geoModel";

export class GeoPushpinChartConfigurationViewportExample extends Component {
    public render(): React.ReactNode {
        return (
            <div
                style={{ height: "500px", position: "relative" }}
                className="s-geo-pushpin-chart-configuration-viewport"
            >
                <GeoPushpinChart
                    location={locationAttribute}
                    config={{
                        mapboxToken: MAPBOX_TOKEN,
                        viewport: {
                            area: "continent_sa",
                        },
                    }}
                    onError={this.onError}
                />
            </div>
        );
    }

    private onError(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationViewportExample onError", ...params);
    }
}

export default GeoPushpinChartConfigurationViewportExample;
