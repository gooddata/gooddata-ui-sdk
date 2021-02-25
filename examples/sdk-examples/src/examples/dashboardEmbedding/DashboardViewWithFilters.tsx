// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import DashboardViewWithFilters from "./DashboardViewWithFiltersSrc";
import DashboardViewWithFiltersSRC from "!raw-loader!./DashboardViewWithFiltersSrc";
import DashboardViewWithFiltersSRCJS from "!raw-loader!../../../examplesJS/dashboardEmbedding/DashboardViewWithFiltersSrc";

const DashboardView = (): JSX.Element => (
    <div>
        <h1>DashboardView with filters</h1>

        <p>
            Example of how to embed a Dashboard into your application with custom filters – the same Dashboard
            as in the previous example filtered only to California (disregarding any filters set on the
            Dashboard itself, if you do not want that, see the next example).
        </p>

        <ExampleWithSource
            for={DashboardViewWithFilters}
            source={DashboardViewWithFiltersSRC}
            sourceJS={DashboardViewWithFiltersSRCJS}
        />
    </div>
);

export default DashboardView;
