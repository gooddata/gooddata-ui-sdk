// (C) 2021-2025 GoodData Corporation

import { Treemap } from "@gooddata/sdk-ui-charts";

import * as Catalog from "../catalog.js";
import { Hint } from "../Hint.js";

export function Example() {
    return (
        <>
            <h1>Revenue Treemap</h1>

            {/* Try editing the component below 👇 */}
            <div style={{ height: 300 }}>
                <Treemap
                    measures={[Catalog.GrossProfit]}
                    viewBy={Catalog.ProductCategory}
                    segmentBy={Catalog.CustomerCountry}
                    //config={{ legend: { position: "top" } }}
                />
            </div>

            <Hint hint="Uncomment the config prop to change the legend position" />
        </>
    );
}
