// (C) 2021-2025 GoodData Corporation

import { IPivotTableConfig, PivotTable } from "@gooddata/sdk-ui-pivot";

import * as Catalog from "../catalog.js";
import { Hint } from "../Hint.js";

const revenue = Catalog.GrossProfit;
// Try uncomment lines below 👇
const config: IPivotTableConfig = { columnSizing: { growToFit: true, defaultWidth: "viewport" } };

export function Example() {
    return (
        <>
            <h1>Pivot table</h1>

            <div style={{ height: 400 }}>
                <PivotTable
                    measures={[revenue, Catalog.OrderAmount]}
                    rows={[Catalog.ProductCategory, Catalog.ProductBrand]}
                    // Try uncomment lines below 👇
                    config={config}
                />
            </div>
            <Hint hint="Try to uncomment config to fix table sizing." />
        </>
    );
}
