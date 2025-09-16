// (C) 2021-2025 GoodData Corporation

import { ComboChart } from "@gooddata/sdk-ui-charts";

import * as Catalog from "../catalog.js";
import Hint from "../Hint.js";

export default function Example() {
    return (
        <>
            <h1>How Profit Ties to # of Orders</h1>

            {/* Try editing the component below 👇 */}
            <div style={{ height: 300 }}>
                <ComboChart
                    primaryMeasures={[Catalog.GrossProfit]}
                    //secondaryMeasures={[Catalog.NrOfOrders]}
                    viewBy={[Catalog.DateDatasets.Date.DateMonthYear.Default]}
                />
            </div>

            <Hint hint="Try uncommenting the secondaryMeasures line in the source code" />
        </>
    );
}
