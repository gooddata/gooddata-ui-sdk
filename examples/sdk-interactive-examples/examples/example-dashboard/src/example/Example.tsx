// (C) 2021-2024 GoodData Corporation
import React from "react";
import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import * as Catalog from "../catalog.js";
import Hint from "../Hint.js";

// Try editing lines below 👇
const dashboard = Catalog.Dashboards._2Sales;
//const dashboard = Catalog.Dashboards._3Customers;

export default () => {
    return (
        <>
            <h1>Dashboard component</h1>
            <Dashboard dashboard={dashboard} config={{ isReadOnly: true }} />

            <Hint hint="Try to change dashboard in code." />
        </>
    );
};
