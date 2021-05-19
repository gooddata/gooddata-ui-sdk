// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";
import { Link } from "react-router-dom";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import DashboardViewWithDrilling from "./DashboardViewWithDrillingSrc";
import DashboardViewWithDrillingSRC from "./DashboardViewWithDrillingSrc?raw";
import DashboardViewWithDrillingSRCJS from "./DashboardViewWithDrillingSrc?rawJS";

const DashboardView = (): JSX.Element => (
    <div>
        <h1>DashboardView with drilling</h1>

        <p>
            Example of how to embed a Dashboard into your application with added drilling – the same Dashboard
            as in the <Link to="/dashboardView/simple">Simple example</Link> with Daly City with enabled
            drilling (check the console logs for results).
        </p>

        <ExampleWithSource
            for={DashboardViewWithDrilling}
            source={DashboardViewWithDrillingSRC}
            sourceJS={DashboardViewWithDrillingSRCJS}
        />
    </div>
);

export default DashboardView;
