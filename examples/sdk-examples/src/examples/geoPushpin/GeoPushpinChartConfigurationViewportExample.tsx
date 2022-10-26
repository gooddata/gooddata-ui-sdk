// (C) 2007-2022 GoodData Corporation
import React from "react";
import { GeoPushpinChart, IGeoConfig } from "@gooddata/sdk-ui-geo";

import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { locationAttribute } from "../../md/geoModel";
import { OnError } from "@gooddata/sdk-ui";

const GEO_CHART_CONFIG: IGeoConfig = {
    mapboxToken: MAPBOX_TOKEN,
    viewport: {
        area: "continent_sa",
    },
};

export const GeoPushpinChartConfigurationViewportExample: React.FC = () => {
    const onError: OnError = () => {
        // handle the callback here
    };

    return (
        <div
            style={{ height: "500px", position: "relative" }}
            className="s-geo-pushpin-chart-configuration-viewport"
        >
            <GeoPushpinChart location={locationAttribute} config={GEO_CHART_CONFIG} onError={onError} />
        </div>
    );
};

export default GeoPushpinChartConfigurationViewportExample;
