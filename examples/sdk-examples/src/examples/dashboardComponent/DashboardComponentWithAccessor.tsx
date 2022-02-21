// (C) 2022 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import DashboardComponentWithAccessorSrc from "./DashboardComponentWithAccessorSrc";
import DashboardComponentWithAccessorSRC from "./DashboardComponentWithAccessorSrc?raw";
import DashboardComponentWithAccessorSRCJS from "./DashboardComponentWithAccessorSrc?rawJS";

const DashboardWithAccessor = (): JSX.Element => (
    <div>
        <h1>Dashboard with accessor</h1>

        <p>
            Example on how to set up dashboard with store accessors to access the Dashboard state from outside
            of the Dashboard. See{" "}
            <a href="https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.singledashboardstoreaccessor.html">
                SingleDashboardStoreAccessor
            </a>{" "}
            and{" "}
            <a href="https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.dashboardstoreaccessorrepository.html">
                DashboardStoreAccessorRepository
            </a>{" "}
            for the full API reference.
        </p>

        <ExampleWithSource
            for={DashboardComponentWithAccessorSrc}
            source={DashboardComponentWithAccessorSRC}
            sourceJS={DashboardComponentWithAccessorSRCJS}
        />
    </div>
);

export default DashboardWithAccessor;
