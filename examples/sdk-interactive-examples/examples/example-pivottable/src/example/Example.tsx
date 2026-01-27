// (C) 2021-2026 GoodData Corporation

import { type IPivotTableConfig, PivotTable } from "@gooddata/sdk-ui-pivot";

import { GrossProfit, OrderAmount, ProductBrand, ProductCategory } from "../catalog.js";
import { Hint } from "../Hint.js";

const revenue = GrossProfit;
// Try uncomment lines below 👇
const config: IPivotTableConfig = { columnSizing: { growToFit: true, defaultWidth: "viewport" } };

export function Example() {
    return (
        <>
            <h1>Pivot table</h1>

            <div style={{ height: 400 }}>
                <PivotTable
                    measures={[revenue, OrderAmount]}
                    rows={[ProductCategory, ProductBrand]}
                    // Try uncomment lines below 👇
                    config={config}
                />
            </div>
            <Hint hint="Try to uncomment config to fix table sizing." />
        </>
    );
}
