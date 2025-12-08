// (C) 2023-2025 GoodData Corporation

import { useState } from "react";

import {
    IAttributeFilter,
    newMeasureSort,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";

import * as Catalog from "../catalog.js";
import { Hint } from "../Hint.js";

export function Example() {
    const [filter1, setFilter1] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(Catalog.CustomerCountry, ["United States"]),
    );
    const [filter2, setFilter2] = useState<IAttributeFilter>(
        newPositiveAttributeFilter(Catalog.CustomerState, ["New Brunswick", "Quebec"]),
    );
    const [filter3, setFilter3] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(Catalog.CustomerCity.Default, [
            "Akron",
            "Atlanta",
            "Chicago",
            "Bathurst",
            "Cacouna",
            "Fredericton",
            "Laval",
            "Montreal",
            "Sherbrooke",
        ]),
    );
    const sortBy = [newMeasureSort(Catalog.GrossProfit, "desc")];

    return (
        <>
            <h1>Dependent Attribute Filters</h1>

            <div style={{ margin: 10, display: "flex", gap: 10 }}>
                <AttributeFilter filter={filter1} onApply={(filter) => setFilter1(filter)} />
                <AttributeFilter
                    filter={filter2}
                    onApply={(filter) => setFilter2(filter)}
                    parentFilters={[filter1]}
                    resetOnParentFilterChange={false}
                />
                <AttributeFilter
                    filter={filter3}
                    onApply={(filter) => setFilter3(filter)}
                    parentFilters={[filter1, filter2]}
                    resetOnParentFilterChange={false}
                />
            </div>

            <div style={{ height: 480 }}>
                <BarChart
                    measures={[Catalog.GrossProfit]}
                    viewBy={Catalog.CustomerCity.Default}
                    filters={[filter1, filter2, filter3]}
                    config={{ legend: { enabled: false } }}
                    sortBy={sortBy}
                />
            </div>

            <Hint hint="Check out the Dependent Attribute Filters at the top" />
        </>
    );
}
