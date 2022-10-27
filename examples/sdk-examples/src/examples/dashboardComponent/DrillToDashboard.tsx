// (C) 2007-2022 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import DrillToDashboard from "./DrillToDashboardSrc";
import DrillToDashboardSRC from "./DrillToDashboardSrc?raw";
import DrillToDashboardSRCJS from "./DrillToDashboardSrc?rawJS";

const DrillToDashboardExample = (): JSX.Element => (
    <div>
        <h1>Drill To Dashboard</h1>

        <p>Example how to handle drill to dashboard in your own application.</p>
        <p>
            <strong>Note:</strong>Dashboard drill events and commands are still in <code>@alpha</code> stage,
            so there may be some breaking changes in the upcoming minor releases.
        </p>

        <ExampleWithSource
            for={DrillToDashboard}
            source={DrillToDashboardSRC}
            sourceJS={DrillToDashboardSRCJS}
        />
    </div>
);

export default DrillToDashboardExample;
