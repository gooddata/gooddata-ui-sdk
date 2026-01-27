// (C) 2021-2026 GoodData Corporation

import {
    DateGranularity,
    type IAttribute,
    type IFilter,
    type IMeasure,
    modifyAttribute,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";
import { ComboChart } from "@gooddata/sdk-ui-charts";

import { DateDatasets, GrossProfit, NrOfOrders } from "../catalog.js";
import { Hint } from "../Hint.js";

const primaryMeasures: IMeasure[] = [GrossProfit];
const secondaryMeasures: IMeasure[] = [NrOfOrders];

const viewBy: IAttribute[] = [
    // for viewBe we want to rename the attribute to see it on axis label "Date - Month"
    //👉 try to rename it to Date
    modifyAttribute(DateDatasets.CustomerCreatedDate.CustomerCreatedDateMonthYear.Default, (a) =>
        a.alias("Date - Month"),
    ),
];

const filters: IFilter[] = [
    newRelativeDateFilter(DateDatasets.CustomerCreatedDate, DateGranularity["month"], -11, 0), // 👉 Try -5, 0
];
const style = { height: 400 };

export function Example() {
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
