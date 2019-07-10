// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { ColumnChart, Model } from "@gooddata/react-components";
import "@gooddata/react-components/styles/css/main.css";

import {
    totalSalesIdentifier,
    totalCostsIdentifier,
    locationStateDisplayFormIdentifier,
    projectId,
} from "../utils/fixtures";

export class DualAxisColumnChartExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("ColumnChartExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("ColumnChartExample onError", ...params);
    }

    render() {
        const totalCostsLocalIdentifier = "totalCosts";
        const totalSalesLocalIdentifier = "totalSales";

        const totalCosts = Model.measure(totalCostsIdentifier)
            .format("#,##0")
            .alias("$ Total Costs")
            .localIdentifier(totalCostsLocalIdentifier);

        const totalSales = Model.measure(totalSalesIdentifier)
            .format("#,##0")
            .alias("$ Total Sales");

        const localState = Model.attribute(locationStateDisplayFormIdentifier);

        const config = {
            secondary_yaxis: {
                visible: true,
                labelsEnabled: true,
                rotation: "auto",
                min: "-75000000",
                max: "75000000",
                measures: [totalCostsLocalIdentifier],
            },
            yaxis: {
                visible: true,
                labelsEnabled: true,
                rotation: "auto",
                min: "-75000000",
                max: "75000000",
                measures: [totalSalesLocalIdentifier],
            },
        };

        return (
            <div style={{ height: 300 }} className="s-dual-axis-column-chart">
                <ColumnChart
                    projectId={projectId}
                    measures={[totalCosts, totalSales]}
                    viewBy={localState}
                    onLoadingChanged={this.onLoadingChanged}
                    config={config}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default DualAxisColumnChartExample;
