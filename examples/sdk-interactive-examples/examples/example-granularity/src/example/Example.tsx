// (C) 2021-2025 GoodData Corporation

import React, { useState } from "react";

import { DateGranularity, newRelativeDateFilter } from "@gooddata/sdk-model";
import { ComboChart } from "@gooddata/sdk-ui-charts";

import { GranularitySelector } from "./GranularitySelector.js";
import * as Catalog from "../catalog.js";
import Hint from "../Hint.js";

// Try changing default granularity to Catalog.DateDatasets.CustomerCreatedDate.CustomerCreatedDateMonthYear.Default 👇
const defaultGranularity = Catalog.DateDatasets.CustomerCreatedDate.CustomerCreatedDateQuarterYear.Default;

export default function Example() {
    const [granularity, setGranularity] = useState(defaultGranularity);

    return (
        <>
            <h1>Gross profit and # of Orders</h1>
            <h2>Yearly, Quarterly, Monthly</h2>

            <GranularitySelector granularity={granularity} setGranularity={setGranularity} />

            <div style={{ height: 300 }}>
                <ComboChart
                    primaryMeasures={[Catalog.GrossProfit]}
                    secondaryMeasures={[Catalog.NrOfOrders]}
                    viewBy={[granularity]}
                    filters={[
                        newRelativeDateFilter(
                            Catalog.DateDatasets.CustomerCreatedDate,
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
