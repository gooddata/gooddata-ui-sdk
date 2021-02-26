// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";
import { Link } from "react-router-dom";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import DashboardViewWithMergedFilters from "./DashboardViewWithMergedFiltersSrc";
import DashboardViewWithMergedFiltersSRC from "!raw-loader!./DashboardViewWithMergedFiltersSrc";
import DashboardViewWithMergedFiltersSRCJS from "!raw-loader!../../../examplesJS/dashboardEmbedding/DashboardViewWithMergedFiltersSrc";

const DashboardView = (): JSX.Element => (
    <div>
        <h1>DashboardView with merged filters</h1>

        <p>
            Example of how to embed a Dashboard into your application with custom filters combined with the
            filters already specified on the dashboard itself – the same Dashboard as in the{" "}
            <Link to="/dashboardView/simple">Simple example</Link> with added filter only to California (this
            also respects the filters set on the Dashboard itself, if you do not want that, see the{" "}
            <Link to="/dashboardView/with-filters">{'"With filters"'} example</Link>).
        </p>

        <ExampleWithSource
            for={DashboardViewWithMergedFilters}
            source={DashboardViewWithMergedFiltersSRC}
            sourceJS={DashboardViewWithMergedFiltersSRCJS}
        />
    </div>
);

export default DashboardView;
