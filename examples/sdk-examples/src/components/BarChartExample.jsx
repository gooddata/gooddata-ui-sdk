// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { BarChart, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import { totalSalesIdentifier, locationResortIdentifier, projectId } from "../utils/fixtures";

export class BarChartExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        console.info("BarChartExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        console.info("BarChartExample onLoadingChanged", ...params);
    }

    render() {
        const amount = Model.measure(totalSalesIdentifier)
            .format("#,##0")
            .alias("$ Total Sales")
            .localIdentifier("totalSales");

        const locationResort = Model.attribute(locationResortIdentifier).localIdentifier("locationResort");

        return (
            <div style={{ height: 300 }} className="s-bar-chart">
                <BarChart
                    projectId={projectId}
                    measures={[amount]}
                    viewBy={locationResort}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default BarChartExample;
