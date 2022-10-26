// (C) 2020-2022 GoodData Corporation
import React from "react";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { CenterPositionChangedCallback, GeoPushpinChart, ZoomChangedCallback } from "@gooddata/sdk-ui-geo";
import { CUSTOM_COLOR_PALETTE } from "../../constants/colors";
import {
    tooltipTextAttribute,
    sizeMeasure,
    locationAttribute,
    segmentByAttribute,
    colorMeasure,
    attributeUriPredicate,
} from "../../md/geoModel";
import { HeaderPredicates, OnError, OnLoadingChanged } from "@gooddata/sdk-ui";
import { IColorMapping } from "@gooddata/sdk-ui-charts";

const colorMapping: IColorMapping[] = [
    {
        predicate: attributeUriPredicate, // find attribute item by uri
        color: {
            type: "guid",
            value: "03",
        },
    },
    {
        predicate: HeaderPredicates.attributeItemNameMatch("Hawaii"),
        color: {
            type: "rgb",
            value: { r: 162, g: 37, b: 34 },
        },
    },
];

const GEO_CHART_CONFIG = {
    tooltipText: tooltipTextAttribute,
    mapboxToken: MAPBOX_TOKEN,
    colorPalette: CUSTOM_COLOR_PALETTE,
    colorMapping,
};

export const GeoPushpinChartConfigurationColorMappingExample: React.FC = () => {
    const onLoadingChanged: OnLoadingChanged = () => {
        // handle the callback here
    };

    const onError: OnError = () => {
        // handle the callback here
    };

    const onZoomChanged: ZoomChangedCallback = () => {
        // handle the callback here
    };

    const onCenterPositionChanged: CenterPositionChangedCallback = () => {
        // handle the callback here
    };

    return (
        <div
            style={{ height: "500px", position: "relative" }}
            className="s-geo-pushpin-chart-configuration-custom-color"
        >
            <GeoPushpinChart
                location={locationAttribute}
                size={sizeMeasure}
                color={colorMeasure}
                segmentBy={segmentByAttribute}
                config={GEO_CHART_CONFIG}
                onZoomChanged={onZoomChanged}
                onCenterPositionChanged={onCenterPositionChanged}
                onLoadingChanged={onLoadingChanged}
                onError={onError}
            />
        </div>
    );
};

export default GeoPushpinChartConfigurationColorMappingExample;
