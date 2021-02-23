// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import SimpleDashboardView from "./SimpleDashboardViewSrc";
import SimpleDashboardViewSRC from "!raw-loader!./SimpleDashboardViewSrc";
import SimpleDashboardViewSRCJS from "!raw-loader!../../../examplesJS/dashboardEmbedding/SimpleDashboardViewSrc";

const DashboardView = (): JSX.Element => (
    <div>
        <h1>Simple DashboardView</h1>

        <p>
            Simple example of how to embed a Dashboard into your application. There is a filter set on this
            Dashboard itself to show only <em>Fine Dining</em> restaurants.
        </p>

        <ExampleWithSource
            for={SimpleDashboardView}
            source={SimpleDashboardViewSRC}
            sourceJS={SimpleDashboardViewSRCJS}
        />
    </div>
);

export default DashboardView;
