// (C) 2021-2026 GoodData Corporation

import { newPreviousPeriodMeasure, newRelativeDateFilter } from "@gooddata/sdk-model";
import { Headline } from "@gooddata/sdk-ui-charts";

import { DateDatasets, GrossProfit } from "../catalog.js";

const primaryMeasure = GrossProfit;

const secondaryMeasure = newPreviousPeriodMeasure(
    primaryMeasure,
    [{ dataSet: DateDatasets.Date.identifier, periodsAgo: 1 }],
    (m) => m.alias("$ Gross profit - month ago"),
);

const thisMonthDateFilter = newRelativeDateFilter(DateDatasets.Date, "GDC.time.month", 0, 0);

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
