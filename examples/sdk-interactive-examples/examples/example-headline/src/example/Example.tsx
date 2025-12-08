// (C) 2021-2025 GoodData Corporation

import { newPreviousPeriodMeasure, newRelativeDateFilter } from "@gooddata/sdk-model";
import { Headline } from "@gooddata/sdk-ui-charts";

import * as Catalog from "../catalog.js";

const primaryMeasure = Catalog.GrossProfit;

const secondaryMeasure = newPreviousPeriodMeasure(
    primaryMeasure,
    [{ dataSet: Catalog.DateDatasets.Date.identifier, periodsAgo: 1 }],
    (m) => m.alias("$ Gross profit - month ago"),
);

const thisMonthDateFilter = newRelativeDateFilter(Catalog.DateDatasets.Date, "GDC.time.month", 0, 0);

export function Example() {
    return (
        <>
            <h1>Gross profit this month vs previous</h1>

            <Headline
                primaryMeasure={primaryMeasure}
                secondaryMeasures={[secondaryMeasure]}
                filters={[thisMonthDateFilter]}
            />
        </>
    );
}
