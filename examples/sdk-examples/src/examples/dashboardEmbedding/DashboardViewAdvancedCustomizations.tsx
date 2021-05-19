// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import CustomDashboardViewAdvanced from "./DashboardViewAdvancedCustomizationsSrc";
import CustomDashboardViewAdvancedSRC from "./DashboardViewAdvancedCustomizationsSrc?raw";
import CustomDashboardViewAdvancedSRCJS from "./DashboardViewAdvancedCustomizationsSrc?rawJS";

const DashboardView = (): JSX.Element => (
    <div>
        <h1>DashboardView with advanced customizations</h1>

        <p>
            Example of dashboard view with custom layout transforms (e.g. filtering layout items, adding
            custom widget, custom layout sizing).
        </p>

        <ExampleWithSource
            for={CustomDashboardViewAdvanced}
            source={CustomDashboardViewAdvancedSRC}
            sourceJS={CustomDashboardViewAdvancedSRCJS}
        />
    </div>
);

export default DashboardView;
