// (C) 2021-2025 GoodData Corporation

import { Execute } from "@gooddata/sdk-ui";

import { CustomVisualization } from "./CustomVisualization.js";
import * as Catalog from "../catalog.js";
import Hint from "../Hint.js";

export default function Example() {
    return (
        <>
            <h1>Custom Visualization</h1>

            <div style={{ height: 400 }}>
                <Execute
                    seriesBy={[Catalog.GrossProfit]}
                    slicesBy={[Catalog.ProductCategory, Catalog.CustomerCountry]}
                >
                    {(props) => <CustomVisualization {...props} measure={Catalog.GrossProfit} />}
                </Execute>
            </div>

            <Hint hint="This chart has been built using the Execute component and Highcharts library." />
        </>
    );
}
