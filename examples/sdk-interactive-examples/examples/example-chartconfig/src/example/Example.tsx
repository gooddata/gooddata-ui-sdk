// (C) 2021 GoodData Corporation
import React from "react";
import { Treemap } from "@gooddata/sdk-ui-charts";
import * as Catalog from "../catalog.js";
import Hint from "../Hint.js";

export default () => (
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
