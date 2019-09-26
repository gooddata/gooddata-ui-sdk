// (C) 2007-2019 GoodData Corporation

import React, { Component } from "react";
import { Headline, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import { totalSalesIdentifier, dateDataSetUri, projectId } from "../utils/fixtures";

export class PreviousPeriodHeadlineExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("PreviousPeriodHeadlineExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("PreviousPeriodHeadlineExample onError", ...params);
    }

    render() {
        const primaryMeasure = Model.measure(totalSalesIdentifier)
            .localIdentifier("totalSales")
            .alias("$ Total Sales");
        const secondaryMeasure = Model.previousPeriodMeasure("totalSales", [
            { dataSet: dateDataSetUri, periodsAgo: 1 },
        ])
            .alias("$ Total Sales - period ago")
            .localIdentifier("totalSalesPeriod");
        return (
            <div style={{ height: 125 }} className="s-headline">
                <Headline
                    projectId={projectId}
                    primaryMeasure={primaryMeasure}
                    secondaryMeasure={secondaryMeasure}
                    filters={[Model.relativeDateFilter(dateDataSetUri, "GDC.time.year", -2, -1)]}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default PreviousPeriodHeadlineExample;
