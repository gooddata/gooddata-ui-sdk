// (C) 2021-2024 GoodData Corporation
import React from "react";
import { Repeater } from "@gooddata/sdk-ui-charts";
import { measureLocalId, modifyAttribute } from "@gooddata/sdk-model";
import * as Catalog from "../catalog.js";
import Hint from "../Hint.js";

const productCategoryRow = modifyAttribute(Catalog.ProductCategory, (a) => a.localId("productCategoryRow"));
const productCategoryColumn = modifyAttribute(Catalog.ProductCategory, (a) =>
    a.localId("productCategoryColumn"),
);
const numberOfOrdersColumn = Catalog.NrOfOrders;
const orderDateMonthYear = Catalog.DateDatasets.OrderDate.OrderDateMonthYear.Default;

export default () => (
    <>
        <h1># of Orders across Product Category</h1>

        {/* Try editing the component below 👇 */}
        <div style={{ height: 300 }}>
            <Repeater
                attribute={productCategoryRow}
                columns={[productCategoryColumn, numberOfOrdersColumn]}
                viewBy={orderDateMonthYear}
                config={{
                    inlineVisualizations: {
                        [measureLocalId(numberOfOrdersColumn)]: {
                            type: "line",
                        },
                    },
                    rowHeight: "large",
                }}
            />
        </div>

        <Hint hint="Try to use different date granularity and inline visualization type." />
    </>
);
