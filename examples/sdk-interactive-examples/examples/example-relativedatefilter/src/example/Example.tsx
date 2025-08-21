// (C) 2021-2025 GoodData Corporation
import React from "react";

import {
    DateGranularity,
    IAttribute,
    IFilter,
    IMeasure,
    modifyAttribute,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";
import { ComboChart } from "@gooddata/sdk-ui-charts";

import * as Catalog from "../catalog.js";
import Hint from "../Hint.js";

const primaryMeasures: IMeasure[] = [Catalog.GrossProfit];
const secondaryMeasures: IMeasure[] = [Catalog.NrOfOrders];

const viewBy: IAttribute[] = [
    // for viewBe we want to rename the attribute to see it on axis label "Date - Month"
    //👉 try to rename it to Date
    modifyAttribute(Catalog.DateDatasets.CustomerCreatedDate.CustomerCreatedDateMonthYear.Default, (a) =>
        a.alias("Date - Month"),
    ),
];

const filters: IFilter[] = [
    newRelativeDateFilter(Catalog.DateDatasets.CustomerCreatedDate, DateGranularity.month, -11, 0), // 👉 Try -5, 0
];
const style = { height: 400 };

export default function Example() {
    return (
        <>
            <h1>Gross profit and # of Orders</h1>
            <div style={style}>
                <ComboChart
                    primaryMeasures={primaryMeasures}
                    secondaryMeasures={secondaryMeasures}
                    viewBy={viewBy}
                    filters={filters}
                />
            </div>
            <Hint hint="Update the source code to show the last 6 months" />
        </>
    );
}
