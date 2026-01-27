// (C) 2021-2026 GoodData Corporation

import { Dashboard } from "@gooddata/sdk-ui-dashboard";

import { Dashboards } from "../catalog.js";
import { Hint } from "../Hint.js";

// Try editing lines below 👇
const dashboard = Dashboards._2Sales;
//const dashboard = Dashboards._3Customers;

export function Example() {
    return (
        <>
            <h1>Dashboard component</h1>
            <Dashboard dashboard={dashboard} config={{ isReadOnly: true }} />

            <Hint hint="Try to change dashboard in code." />
        </>
    );
}
