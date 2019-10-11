// (C) 2007-2019 GoodData Corporation

import React, { Component } from "react";
import { Table } from "@gooddata/sdk-ui";
import {
    newAttribute,
    newMeasure,
    newPreviousPeriodMeasure,
    newArithmeticMeasure,
    newAbsoluteDateFilter,
} from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

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
        const totalSalesYearAgoBucketItem = newPreviousPeriodMeasure(
            "totalSales",
            [{ dataSet: dateDataSetUri, periodsAgo: 1 }],
            m => m.alias("$ Total Sales - year ago"),
        );

        const totalSalesBucketItem = newMeasure(totalSalesIdentifier, m => m.alias("$ Total Sales"));

        const changeMeasure = newArithmeticMeasure(
            [
                totalSalesBucketItem.measure.localIdentifier,
                totalSalesYearAgoBucketItem.measure.localIdentifier,
            ],
            "change",
            m => m.title("% Total Sales Change"),
        );

        const measures = [totalSalesYearAgoBucketItem, totalSalesBucketItem, changeMeasure];

        const attributes = [newAttribute(monthDateIdentifier)];

        const filters = [newAbsoluteDateFilter(dateDataSetUri, "2017-01-01", "2017-12-31")];

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
