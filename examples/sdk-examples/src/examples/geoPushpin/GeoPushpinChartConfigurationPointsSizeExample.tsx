// (C) 2020-2022 GoodData Corporation
import React, { Component } from "react";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { GeoPushpinChart, IGeoConfig, PushpinSizeOption } from "@gooddata/sdk-ui-geo";
import { locationAttribute, sizeMeasure } from "../../md/geoModel";

const POINT_SIZE_OPTIONS = ["default", "0.5x", "0.75x", "normal", "1.25x", "1.5x"];

type State = {
    minSize: PushpinSizeOption;
    maxSize: PushpinSizeOption;
};

export class GeoPushpinChartConfigurationPointsSizeExample extends Component<unknown, State> {
    state: State = {
        minSize: "default",
        maxSize: "default",
    };

    public render() {
        const { minSize, maxSize } = this.state;
        const geoConfig: IGeoConfig = {
            mapboxToken: MAPBOX_TOKEN,
            points: {
                minSize,
                maxSize,
            },
        };

        return (
            <div className="s-geo-chart">
                <div style={{ marginTop: "10px" }}>
                    {this.renderPointSizeDropDown("minSize", "Min Size")}
                    {this.renderPointSizeDropDown("maxSize", "Max Size")}
                </div>
                <div
                    style={{ height: "500px", position: "relative" }}
                    className="s-geo-pushpin-chart-configuration-points-size"
                >
                    <GeoPushpinChart
                        location={locationAttribute}
                        size={sizeMeasure}
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

    private onLoadingChanged(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationPointsSizeExample onLoadingChanged", ...params);
    }

    private onError(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationPointsSizeExample onError", ...params);
    }

    private onZoomChanged(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationPointsSizeExample onZoomChanged", ...params);
    }

    private onCenterPositionChanged(...params: any[]) {
        // eslint-disable-next-line no-console
        return console.log(
            "GeoPushpinChartConfigurationPointsSizeExample onCenterPositionChanged",
            ...params,
        );
    }

    private onPointSizeChange = (event: any) => {
        const { id, value } = event.target;
        this.setState({
            [id]: value,
        } as any);
    };

    private renderPointSizeDropDown = (id: any, label: any) => (
        <span style={{ display: "inline-block", minWidth: "10em", verticalAlign: "middle" }}>
            {`${label}: `}
            <select id={id} onChange={this.onPointSizeChange}>
                {POINT_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                        {size}
                    </option>
                ))}
            </select>
        </span>
    );
}

export default GeoPushpinChartConfigurationPointsSizeExample;
