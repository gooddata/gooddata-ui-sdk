// (C) 2020-2022 GoodData Corporation
import React, { useState } from "react";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { GeoPushpinChart, IGeoConfig, PushpinSizeOption } from "@gooddata/sdk-ui-geo";
import { locationAttribute, sizeMeasure } from "../../md/geoModel";

const POINT_SIZE_OPTIONS = ["default", "0.5x", "0.75x", "normal", "1.25x", "1.5x"];

export const GeoPushpinChartConfigurationPointsSizeExample: React.FC = () => {
    const [minSize, setMinSize] = useState<PushpinSizeOption>("default");
    const [maxSize, setMaxSize] = useState<PushpinSizeOption>("default");

    const onLoadingChanged = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationPointsSizeExample onLoadingChanged", ...params);
    };

    const onError = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationPointsSizeExample onError", ...params);
    };

    const onZoomChanged = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log("GeoPushpinChartConfigurationPointsSizeExample onZoomChanged", ...params);
    };

    const onCenterPositionChanged = (...params: any[]) => {
        // eslint-disable-next-line no-console
        return console.log(
            "GeoPushpinChartConfigurationPointsSizeExample onCenterPositionChanged",
            ...params,
        );
    };

    const onPointSizeChange = (event: any) => {
        const { id, value } = event.target;
        if (id === "minSize") {
            setMinSize(value);
        } else {
            setMaxSize(value);
        }
    };

    const renderPointSizeDropDown = (id: string, label: string) => (
        <span style={{ display: "inline-block", minWidth: "10em", verticalAlign: "middle" }}>
            {`${label}: `}
            <select id={id} onChange={onPointSizeChange}>
                {POINT_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                        {size}
                    </option>
                ))}
            </select>
        </span>
    );

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
                {renderPointSizeDropDown("minSize", "Min Size")}
                {renderPointSizeDropDown("maxSize", "Max Size")}
            </div>
            <div
                style={{ height: "500px", position: "relative" }}
                className="s-geo-pushpin-chart-configuration-points-size"
            >
                <GeoPushpinChart
                    location={locationAttribute}
                    size={sizeMeasure}
                    config={geoConfig}
                    onZoomChanged={onZoomChanged}
                    onCenterPositionChanged={onCenterPositionChanged}
                    onLoadingChanged={onLoadingChanged}
                    onError={onError}
                />
            </div>
        </div>
    );
};

export default GeoPushpinChartConfigurationPointsSizeExample;
