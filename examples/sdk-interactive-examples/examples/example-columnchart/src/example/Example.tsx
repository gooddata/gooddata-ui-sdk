// (C) 2021-2025 GoodData Corporation

import { ColumnChart } from "@gooddata/sdk-ui-charts";

import * as Catalog from "../catalog.js";
import Hint from "../Hint.js";

export default function Example() {
    return (
        <>
            <h1># of Orders across Product Category</h1>

            {/* Try editing the component below 👇 */}
            <div style={{ height: 300 }}>
                <ColumnChart
                    measures={[Catalog.NrOfOrders]}
                    viewBy={Catalog.ProductCategory}
                    // stackBy={Catalog.CustomerAge}
                />
            </div>

            <Hint hint="Try uncommenting the secondaryMeasures line in the source code" />
        </>
    );
}
