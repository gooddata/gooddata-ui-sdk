// (C) 2021-2025 GoodData Corporation

import { useState } from "react";

import { type IAttributeFilter, newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { Treemap } from "@gooddata/sdk-ui-charts";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";

import * as Catalog from "../catalog.js";
import { Hint } from "../Hint.js";

export function Example() {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(Catalog.ProductCategory, []),
    );
    return (
        <>
            <h1>Attribute Filter Component</h1>

            <div style={{ margin: 10 }}>
                <AttributeFilter filter={filter} onApply={(filter) => setFilter(filter)} />
            </div>

            <div style={{ height: 300 }}>
                <Treemap
                    measures={[Catalog.GrossProfit]}
                    viewBy={Catalog.ProductCategory}
                    segmentBy={Catalog.CustomerCountry}
                    filters={[filter]}
                    config={{ legend: { enabled: false } }}
                />
            </div>

            <Hint hint="Check out the Attribute Filter at the top" />
        </>
    );
}
