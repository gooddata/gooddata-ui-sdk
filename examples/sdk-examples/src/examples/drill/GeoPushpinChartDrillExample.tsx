// (C) 2020-2021 GoodData Corporation
import React from "react";
import "@gooddata/sdk-ui-geo/styles/css/main.css";

import { MAPBOX_TOKEN } from "../../constants/fixtures";
import { IDrillEvent, HeaderPredicates } from "@gooddata/sdk-ui";
import { GeoPushpinChart } from "@gooddata/sdk-ui-geo";
import { locationAttribute, sizeMeasure, colorMeasure, segmentByAttribute } from "../../md/geoModel";

const drillableItems = [
    HeaderPredicates.localIdentifierMatch(sizeMeasure),
    HeaderPredicates.localIdentifierMatch(colorMeasure),
];

type State = {
    drillEvent: IDrillEvent | null;
};

export class GeoPushpinChartDrillExample extends React.Component<unknown, State> {
    state: State = {
        drillEvent: null,
    };

    public render(): React.ReactNode {
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
                        onDrill={this.onDrill}
                    />
                </div>
                {this.renderDrillEvent()}
            </div>
        );
    }

    private onDrill = (drillEvent: any) => this.setState({ drillEvent });

    private renderDrillEvent = () => {
        if (this.state.drillEvent) {
            return (
                <pre style={{ height: 400, overflow: "scroll" }}>
                    {JSON.stringify(this.state.drillEvent.drillContext, null, 4)}
                </pre>
            );
        }

        return null;
    };
}

export default GeoPushpinChartDrillExample;
