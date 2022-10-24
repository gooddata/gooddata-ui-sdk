// (C) 2020-2022 GoodData Corporation
import React from "react";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { GeoPushpinChart, IGeoConfig } from "@gooddata/sdk-ui-geo";
import { locationAttribute, segmentByAttribute, sizeMeasure } from "../../md/geoModel";
import { OnError } from "@gooddata/sdk-ui";
import noop from "lodash/noop";

const GEO_CHART_CONFIG: IGeoConfig = {
    mapboxToken: MAPBOX_TOKEN,
    legend: {
        position: "right", // could be "top", "right", "bottom" or "left"
    },
};

export const GeoPushpinChartConfigurationLegendExample: React.FC = () => {
    const onError: OnError = (_params) => {
        // handle the callback here
        return noop;
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
                config={GEO_CHART_CONFIG}
                onError={onError}
            />
        </div>
    );
};

export default GeoPushpinChartConfigurationLegendExample;
