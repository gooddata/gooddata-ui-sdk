// (C) 2021-2026 GoodData Corporation

import { useState } from "react";

import { DateGranularity, newRelativeDateFilter } from "@gooddata/sdk-model";
import { ComboChart } from "@gooddata/sdk-ui-charts";

import { GranularitySelector } from "./GranularitySelector.js";
import { DateDatasets, GrossProfit, NrOfOrders } from "../catalog.js";
import { Hint } from "../Hint.js";

// Try changing default granularity to DateDatasets.CustomerCreatedDate.CustomerCreatedDateMonthYear.Default 👇
const defaultGranularity = DateDatasets.CustomerCreatedDate.CustomerCreatedDateQuarterYear.Default;

export function Example() {
    const [granularity, setGranularity] = useState(defaultGranularity);

    return (
        <>
            <h1>Gross profit and # of Orders</h1>
            <h2>Yearly, Quarterly, Monthly</h2>

            <GranularitySelector granularity={granularity} setGranularity={setGranularity} />

            <div style={{ height: 300 }}>
                <ComboChart
                    primaryMeasures={[GrossProfit]}
                    secondaryMeasures={[NrOfOrders]}
                    viewBy={[granularity]}
                    filters={[
                        newRelativeDateFilter(
                            DateDatasets.CustomerCreatedDate,
                            DateGranularity["year"],
                            -1,
                            0,
                        ),
                    ]}
                    config={{ legend: { enabled: false } }}
                />
            </div>

            <Hint hint="Simple granularity switcher implemented using radio buttons" />
        </>
    );
}
