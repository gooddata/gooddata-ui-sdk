// (C) 2007-2021 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import DashboardComponentWithLocalPlugin from "./DashboardComponentWithLocalPluginSrc";
import DashboardComponentWithLocalPluginSRC from "./DashboardComponentWithLocalPluginSrc?raw";
import DashboardComponentWithLocalPluginSRCJS from "./DashboardComponentWithLocalPluginSrc?rawJS";

const DashboardWithLocalPlugin = (): JSX.Element => (
    <div>
        <h1>Dashboard with local plugin</h1>

        <p>
            Example on how to embed a dashboard with a local plugin. The example plugin adds a new section to
            the Dashboard and renders a custom visualization there. Note that the custom visualization
            respects the dashboard filters.
        </p>

        <ExampleWithSource
            for={DashboardComponentWithLocalPlugin}
            source={DashboardComponentWithLocalPluginSRC}
            sourceJS={DashboardComponentWithLocalPluginSRCJS}
        />
    </div>
);

export default DashboardWithLocalPlugin;
