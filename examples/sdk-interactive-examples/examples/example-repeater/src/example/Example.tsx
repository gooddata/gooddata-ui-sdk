// (C) 2021-2026 GoodData Corporation

import { measureLocalId, modifyAttribute } from "@gooddata/sdk-model";
import { Repeater } from "@gooddata/sdk-ui-charts";

import { DateDatasets, NrOfOrders, ProductCategory } from "../catalog.js";
import { Hint } from "../Hint.js";

const productCategoryRow = modifyAttribute(ProductCategory, (a) => a.localId("productCategoryRow"));
const productCategoryColumn = modifyAttribute(ProductCategory, (a) => a.localId("productCategoryColumn"));
const numberOfOrdersColumn = NrOfOrders;
const orderDateMonthYear = DateDatasets.OrderDate.OrderDateMonthYear.Default;

export function Example() {
    return (
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
}
