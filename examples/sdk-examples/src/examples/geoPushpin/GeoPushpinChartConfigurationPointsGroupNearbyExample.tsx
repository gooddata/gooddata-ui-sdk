// (C) 2020 GoodData Corporation
import React, { Component } from "react";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { GeoPushpinChart } from "@gooddata/sdk-ui-geo";
import { locationAttribute } from "../../md/geoModel";

type State = {
    groupNearbyPoints: boolean;
};

export class GeoPushpinChartConfigurationPointsGroupNearbyExample extends Component<unknown, State> {
    state: State = {
        groupNearbyPoints: false,
    };

    public render(): React.ReactNode {
        const { groupNearbyPoints } = this.state;
        const geoConfig = {
            mapboxToken: MAPBOX_TOKEN,
            points: {
                groupNearbyPoints,
            },
        };

        return (
            <div className="s-geo-chart">
                <button className="s-change-group-nearby-points" onClick={this.toggleGroupNearbyPoints}>
                    Toggle Group nearby points
                </button>
                <div
                    style={{ height: "500px", position: "relative" }}
                    className="s-geo-pushpin-chart-configuration-points-group-nearby"
                >
                    <GeoPushpinChart
                        location={locationAttribute}
                        config={geoConfig}
                        onZoomChanged={this.onZoomChanged}
                        onCenterPositionChanged={this.onCenterPositionChanged}
                        onLoadingChanged={this.onLoadingChanged}
                        onError={this.onError}
                    />
                </div>
            </div>
        );
    }

    private toggleGroupNearbyPoints = () => {
        this.setState((prevState) => ({
            groupNearbyPoints: !prevState.groupNearbyPoints,
        }));
    };

    private onLoadingChanged(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log(
            "GeoPushpinChartConfigurationPointsGroupNearbyExample onLoadingChanged",
            ...params,
        );
    }

    private onError(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationPointsGroupNearbyExample onError", ...params);
    }

    private onZoomChanged(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationPointsGroupNearbyExample onZoomChanged", ...params);
    }

    private onCenterPositionChanged(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log(
            "GeoPushpinChartConfigurationPointsGroupNearbyExample onCenterPositionChanged",
            ...params,
        );
    }
}

export default GeoPushpinChartConfigurationPointsGroupNearbyExample;
