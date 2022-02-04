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

        <p>Example on how to set up dashboard with store accessors.</p>

        <ExampleWithSource
            for={DashboardComponentWithAccessorSrc}
            source={DashboardComponentWithAccessorSRC}
            sourceJS={DashboardComponentWithAccessorSRCJS}
        />
    </div>
);

export default DashboardWithAccessor;
