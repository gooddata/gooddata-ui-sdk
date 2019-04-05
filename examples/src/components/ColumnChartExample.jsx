// (C) 2007-2019 GoodData Corporation

import React, { Component } from "react";
import { ColumnChart, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import { totalSalesIdentifier, monthDateIdentifier, projectId } from "../utils/fixtures";

export class ColumnChartExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("ColumnChartExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("ColumnChartExample onError", ...params);
    }

    render() {
        const totalSales = Model.measure(totalSalesIdentifier)
            .format("#,##0")
            .alias("$ Total Sales");

        const month = Model.attribute(monthDateIdentifier);

        return (
            <div style={{ height: 300 }} className="s-column-chart">
                <ColumnChart
                    projectId={projectId}
                    measures={[totalSales]}
                    viewBy={month}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default ColumnChartExample;
