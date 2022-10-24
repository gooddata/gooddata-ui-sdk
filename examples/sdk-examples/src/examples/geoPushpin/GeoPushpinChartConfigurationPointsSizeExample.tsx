// (C) 2020-2022 GoodData Corporation
import React, { ChangeEvent, useState } from "react";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import {
    CenterPositionChangedCallback,
    GeoPushpinChart,
    IGeoConfig,
    PushpinSizeOption,
    ZoomChangedCallback,
} from "@gooddata/sdk-ui-geo";
import { locationAttribute, sizeMeasure } from "../../md/geoModel";
import { OnError, OnLoadingChanged } from "@gooddata/sdk-ui";
import noop from "lodash/noop";

const POINT_SIZE_OPTIONS = ["default", "0.5x", "0.75x", "normal", "1.25x", "1.5x"];

const PointSizeDropdown: React.FC<{ id: string; label: string; onChange: (event: any) => void }> = (
    props,
) => {
    const { label, id, onChange } = props;

    return (
        <span style={{ display: "inline-block", minWidth: "10em", verticalAlign: "middle" }}>
            {`${label}: `}
            <select id={id} onChange={onChange}>
                {POINT_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                        {size}
                    </option>
                ))}
            </select>
        </span>
    );
};

export const GeoPushpinChartConfigurationPointsSizeExample: React.FC = () => {
    const [minSize, setMinSize] = useState<PushpinSizeOption>("default");
    const [maxSize, setMaxSize] = useState<PushpinSizeOption>("default");

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

    const onPointSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = event.target;
        if (id === "minSize") {
            setMinSize(value as PushpinSizeOption);
        } else {
            setMaxSize(value as PushpinSizeOption);
        }
    };

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
                <PointSizeDropdown id="minSize" label="Min Size" onChange={onPointSizeChange} />
                <PointSizeDropdown id="maxSize" label="Max Size" onChange={onPointSizeChange} />
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
