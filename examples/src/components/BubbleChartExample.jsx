// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { BubbleChart, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import {
    projectId,
    franchiseFeesIdentifier,
    franchisedSalesIdentifier,
    averageCheckSizeByServer,
    locationResortIdentifier,
} from "../utils/fixtures";

export class BubbleChartExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        console.log("BubbleChartExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        console.log("BubbleChartExample onError", ...params);
    }

    render() {
        const xMeasure = Model.measure(franchiseFeesIdentifier).format("#,##0");

        const yMeasure = Model.measure(franchisedSalesIdentifier).format("#,##0");

        const size = Model.measure(averageCheckSizeByServer);

        const locationResort = Model.attribute(locationResortIdentifier);

        return (
            <div style={{ height: 300 }} className="s-bubble-chart">
                <BubbleChart
                    projectId={projectId}
                    xAxisMeasure={xMeasure}
                    yAxisMeasure={yMeasure}
                    viewBy={locationResort}
                    size={size}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default BubbleChartExample;
