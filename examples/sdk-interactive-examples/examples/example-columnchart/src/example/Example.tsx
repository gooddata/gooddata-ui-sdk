// (C) 2021 GoodData Corporation
import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import * as Catalog from "../catalog.js";
import Hint from "../Hint.js";

export default () => (
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
