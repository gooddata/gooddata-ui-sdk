// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { BarChart, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import ExampleWithExport from "./utils/ExampleWithExport";
import { dateDataSetUri, locationResortIdentifier, projectId, totalSalesIdentifier } from "../utils/fixtures";

export class BarChartExportExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        console.info("BarChartExportExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        console.info("BarChartExportExample onLoadingChanged", ...params);
    }

    render() {
        const amount = Model.measure(totalSalesIdentifier)
            .format("#,##0")
            .alias("$ Total Sales");

        const locationResort = Model.attribute(locationResortIdentifier);

        const filters = [Model.absoluteDateFilter(dateDataSetUri, "2017-01-01", "2017-12-31")];

        return (
            <ExampleWithExport>
                {onExportReady => (
                    <div style={{ height: 300 }} className="s-bar-chart">
                        <BarChart
                            projectId={projectId}
                            measures={[amount]}
                            viewBy={locationResort}
                            filters={filters}
                            onExportReady={onExportReady}
                            onLoadingChanged={this.onLoadingChanged}
                            onError={this.onError}
                        />
                    </div>
                )}
            </ExampleWithExport>
        );
    }
}

export default BarChartExportExample;
