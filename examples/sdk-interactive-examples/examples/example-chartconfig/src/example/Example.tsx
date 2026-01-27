// (C) 2021-2026 GoodData Corporation

import { Treemap } from "@gooddata/sdk-ui-charts";

import { CustomerCountry, GrossProfit, ProductCategory } from "../catalog.js";
import { Hint } from "../Hint.js";

export function Example() {
    return (
        <>
            <h1>Revenue Treemap</h1>

            {/* Try editing the component below 👇 */}
            <div style={{ height: 300 }}>
                <Treemap
                    measures={[GrossProfit]}
                    viewBy={ProductCategory}
                    segmentBy={CustomerCountry}
                    //config={{ legend: { position: "top" } }}
                />
            </div>

            <Hint hint="Uncomment the config prop to change the legend position" />
        </>
    );
}
