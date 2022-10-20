// (C) 2020-2022 GoodData Corporation
import React, { useState } from "react";
import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { IDrillEvent, HeaderPredicates } from "@gooddata/sdk-ui";
import { GeoPushpinChart } from "@gooddata/sdk-ui-geo";
import { locationAttribute, sizeMeasure, colorMeasure, segmentByAttribute } from "../../md/geoModel";

const drillableItems = [
    HeaderPredicates.localIdentifierMatch(sizeMeasure),
    HeaderPredicates.localIdentifierMatch(colorMeasure),
];

export const GeoPushpinChartDrillExample: React.FC = () => {
    const [drillEvent, setDrillEvent] = useState<IDrillEvent | null>(null);

    const onDrill = (drillEvent: any) => setDrillEvent(drillEvent);

    const renderDrillEvent = () => {
        if (drillEvent) {
            return (
                <pre style={{ height: 400, overflow: "scroll" }}>
                    {JSON.stringify(drillEvent.drillContext, null, 4)}
                </pre>
            );
        }

        return null;
    };

    return (
        <div className="s-geo-pushpin-chart-on-drill">
            <div style={{ height: 500, position: "relative" }} className="s-geo-pushpin-chart">
                <GeoPushpinChart
                    location={locationAttribute}
                    size={sizeMeasure}
                    color={colorMeasure}
                    segmentBy={segmentByAttribute}
                    config={{
                        mapboxToken: MAPBOX_TOKEN,
                    }}
                    drillableItems={drillableItems}
                    onDrill={onDrill}
                />
            </div>
            {renderDrillEvent()}
        </div>
    );
};

export default GeoPushpinChartDrillExample;
