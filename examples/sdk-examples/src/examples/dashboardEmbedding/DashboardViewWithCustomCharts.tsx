// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import CustomDashboardView from "./DashboardViewWithCustomChartsSrc";
import CustomDashboardViewSRC from "!raw-loader!./DashboardViewWithCustomChartsSrc";
import CustomDashboardViewSRCJS from "!raw-loader!../../../examplesJS/dashboardEmbedding/DashboardViewWithCustomChartsSrc";

const DashboardView = (): JSX.Element => (
    <div>
        <h1>DashboardView with custom charts</h1>

        <p>Example of how to customize rendering of the particular dashboard widgets with custom charts.</p>

        <ExampleWithSource
            for={CustomDashboardView}
            source={CustomDashboardViewSRC}
            sourceJS={CustomDashboardViewSRCJS}
        />
    </div>
);

export default DashboardView;
