// (C) 2021-2025 GoodData Corporation

import { useState } from "react";

import { ComboChart } from "@gooddata/sdk-ui-charts";
import { DateFilterHelpers, DateFilterOption, RelativeDateFilterOption } from "@gooddata/sdk-ui-filters";

import { Filter } from "./DateFilter.js";
import * as Catalog from "../catalog.js";
import { Hint } from "../Hint.js";

export interface IDateFilterComponentExampleState {
    selectedFilterOption: DateFilterOption;
    excludeCurrentPeriod: boolean;
}

const selectedValue: RelativeDateFilterOption = {
    from: -6,
    to: 0,
    granularity: "GDC.time.date",
    localIdentifier: "LAST_7_DAYS",
    type: "relativePreset",
    visible: true,
    name: "",
};

export function Example() {
    const [filter, setFilter] = useState<IDateFilterComponentExampleState>({
        selectedFilterOption: selectedValue,
        excludeCurrentPeriod: false,
    });

    const dateFilter = DateFilterHelpers.mapOptionToAfm(
        filter.selectedFilterOption,
        Catalog.DateDatasets.Date.ref,
        filter.excludeCurrentPeriod,
    );

    return (
        <>
            <h1>Date Filter Component</h1>

            <div style={{ margin: 10 }}>
                <Filter filter={filter} setFilter={setFilter} />
            </div>

            <div style={{ height: 300 }}>
                <ComboChart
                    primaryMeasures={[Catalog.GrossProfit]}
                    secondaryMeasures={[Catalog.NrOfOrders]}
                    viewBy={[Catalog.DateDatasets.Date.DateDayOfYear.Default]}
                    filters={dateFilter ? [dateFilter] : []}
                />
            </div>

            <Hint hint="Check out the Date Filter at the top." />
        </>
    );
}
