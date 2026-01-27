// (C) 2021-2026 GoodData Corporation

import { ColumnChart } from "@gooddata/sdk-ui-charts";

import { NrOfOrders, ProductCategory } from "../catalog.js";
import { Hint } from "../Hint.js";

export function Example() {
    return (
        <>
            <h1># of Orders across Product Category</h1>

            {/* Try editing the component below 👇 */}
            <div style={{ height: 300 }}>
                <ColumnChart
                    measures={[NrOfOrders]}
                    viewBy={ProductCategory}
                    // stackBy={CustomerAge}
                />
            </div>

            <Hint hint="Try uncommenting the secondaryMeasures line in the source code" />
        </>
    );
}
