// (C) 2007-2019 GoodData Corporation

import React, { Component } from "react";
import { Table, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import { projectId, monthDateIdentifier, totalSalesIdentifier, dateDataSetUri } from "../utils/fixtures";

export class ArithmeticMeasureChangeExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("ArithmeticMeasureChangeExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("ArithmeticMeasureChangeExample onError", ...params);
    }

    render() {
        const totalSalesYearAgoBucketItem = Model.previousPeriodMeasure("totalSales", [
            { dataSet: dateDataSetUri, periodsAgo: 1 },
        ])
            .alias("$ Total Sales - year ago")
            .localIdentifier("totalSales_sp");

        const totalSalesBucketItem = Model.measure(totalSalesIdentifier)
            .localIdentifier("totalSales")
            .alias("$ Total Sales");

        const measures = [
            totalSalesYearAgoBucketItem,
            totalSalesBucketItem,
            Model.arithmeticMeasure(
                [
                    totalSalesBucketItem.measure.localIdentifier,
                    totalSalesYearAgoBucketItem.measure.localIdentifier,
                ],
                "change",
            )
                .title("% Total Sales Change")
                .localIdentifier("totalSalesChange"),
        ];

        const attributes = [Model.attribute(monthDateIdentifier).localIdentifier("month")];

        const filters = [Model.absoluteDateFilter(dateDataSetUri, "2017-01-01", "2017-12-31")];

        return (
            <div style={{ height: 200 }} className="s-table">
                <Table
                    projectId={projectId}
                    measures={measures}
                    filters={filters}
                    attributes={attributes}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default ArithmeticMeasureChangeExample;
