// (C) 2022 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import DashboardComponentWithUseDispatchDashboardCommand from "./DashboardComponentWithUseDispatchDashboardCommandSrc";
import DashboardComponentWithUseDispatchDashboardCommandSRC from "./DashboardComponentWithUseDispatchDashboardCommandSrc?raw";
import DashboardComponentWithUseDispatchDashboardCommandSRCJS from "./DashboardComponentWithUseDispatchDashboardCommandSrc?rawJS";

const DashboardWithUseDispatchDashboardCommand = (): JSX.Element => (
    <div>
        <h1>Dashboard with command dispatch</h1>

        <p>
            Example on how to use{" "}
            <a href="https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.usedispatchdashboardcommand.html">
                useDispatchDashboardCommand
            </a>{" "}
            hook to dispatch commands related to filter selection handling. This example uses plugin to add a
            section with custom widget. This widget contains buttons to dispatch filter selection change
            related commands.
        </p>

        <ExampleWithSource
            for={DashboardComponentWithUseDispatchDashboardCommand}
            source={DashboardComponentWithUseDispatchDashboardCommandSRC}
            sourceJS={DashboardComponentWithUseDispatchDashboardCommandSRCJS}
        />
    </div>
);

export default DashboardWithUseDispatchDashboardCommand;
