// (C) 2021-2026 GoodData Corporation

import { Execute } from "@gooddata/sdk-ui";

import { CustomVisualization } from "./CustomVisualization.js";
import { CustomerCountry, GrossProfit, ProductCategory } from "../catalog.js";
import { Hint } from "../Hint.js";

export function Example() {
    return (
        <>
            <h1>Custom Visualization</h1>

            <div style={{ height: 400 }}>
                <Execute seriesBy={[GrossProfit]} slicesBy={[ProductCategory, CustomerCountry]}>
                    {(props) => <CustomVisualization {...props} measure={GrossProfit} />}
                </Execute>
            </div>

            <Hint hint="This chart has been built using the Execute component and Highcharts library." />
        </>
    );
}
