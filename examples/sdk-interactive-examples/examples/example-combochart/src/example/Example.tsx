// (C) 2021-2026 GoodData Corporation

import { ComboChart } from "@gooddata/sdk-ui-charts";

import { DateDatasets, GrossProfit } from "../catalog.js";
import { Hint } from "../Hint.js";

export function Example() {
    return (
        <>
            <h1>How Profit Ties to # of Orders</h1>

            {/* Try editing the component below 👇 */}
            <div style={{ height: 300 }}>
                <ComboChart
                    primaryMeasures={[GrossProfit]}
                    //secondaryMeasures={[NrOfOrders]}
                    viewBy={[DateDatasets.Date.DateMonthYear.Default]}
                />
            </div>

            <Hint hint="Try uncommenting the secondaryMeasures line in the source code" />
        </>
    );
}
