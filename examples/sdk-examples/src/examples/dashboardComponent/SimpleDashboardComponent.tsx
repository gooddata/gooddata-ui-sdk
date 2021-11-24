// (C) 2007-2021 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import SimpleDashboardComponent from "./SimpleDashboardComponentSrc";
import SimpleDashboardComponentSRC from "./SimpleDashboardComponentSrc?raw";
import SimpleDashboardComponentSRCJS from "./SimpleDashboardComponentSrc?rawJS";

const SimpleDashboard = (): JSX.Element => (
    <div>
        <h1>Simple Dashboard</h1>

        <p>
            Simple example of how to embed a Dashboard into your application. There is a filter set on this
            Dashboard itself to show only <em>Fine Dining</em> restaurants.
        </p>

        <ExampleWithSource
            for={SimpleDashboardComponent}
            source={SimpleDashboardComponentSRC}
            sourceJS={SimpleDashboardComponentSRCJS}
        />
    </div>
);

export default SimpleDashboard;
