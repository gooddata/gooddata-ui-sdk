// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import SimpleDashboardView from "./SimpleDashboardView";
import SimpleDashboardViewSRC from "!raw-loader!./SimpleDashboardView";
import SimpleDashboardViewSRCJS from "!raw-loader!../../../examplesJS/dashboardEmbedding/SimpleDashboardView";

import DashboardViewWithFilters from "./DashboardViewWithFilters";
import DashboardViewWithFiltersSRC from "!raw-loader!./DashboardViewWithFilters";
import DashboardViewWithFiltersSRCJS from "!raw-loader!../../../examplesJS/dashboardEmbedding/DashboardViewWithFilters";

import DashboardViewWithMergedFilters from "./DashboardViewWithMergedFilters";
import DashboardViewWithMergedFiltersSRC from "!raw-loader!./DashboardViewWithMergedFilters";
import DashboardViewWithMergedFiltersSRCJS from "!raw-loader!../../../examplesJS/dashboardEmbedding/DashboardViewWithMergedFilters";

import DashboardViewWithDrilling from "./DashboardViewWithDrilling";
import DashboardViewWithDrillingSRC from "!raw-loader!./DashboardViewWithDrilling";
import DashboardViewWithDrillingSRCJS from "!raw-loader!../../../examplesJS/dashboardEmbedding/DashboardViewWithDrilling";

import DashboardViewWithEmails from "./DashboardViewWithEmails";
import DashboardViewWithEmailsSRC from "!raw-loader!./DashboardViewWithEmails";
import DashboardViewWithEmailsSRCJS from "!raw-loader!../../../examplesJS/dashboardEmbedding/DashboardViewWithEmails";

import CustomDashboardView from "./CustomDashboardView";
import CustomDashboardViewSRC from "!raw-loader!./CustomDashboardView";
import CustomDashboardViewSRCJS from "!raw-loader!../../../examplesJS/dashboardEmbedding/CustomDashboardView";

import DashboardExport from "./DashboardExport";
import DashboardExportSRC from "!raw-loader!./DashboardExport";
import DashboardExportSRCJS from "!raw-loader!../../../examplesJS/dashboardEmbedding/DashboardExport";

export const DashboardView = (): JSX.Element => (
    <div>
        <h1>DashboardView</h1>

        <p>
            Simple example of how to embed a Dashboard into your application. There is a filter set on this
            Dashboard itself to show only <em>Fine Dining</em> restaurants.
        </p>

        <ExampleWithSource
            for={SimpleDashboardView}
            source={SimpleDashboardViewSRC}
            sourceJS={SimpleDashboardViewSRCJS}
        />

        <hr className="separator" />

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

        <hr className="separator" />

        <p>
            Example of how to embed a Dashboard into your application with custom filters combined with the
            filters already specified on the dashboard itself – the same Dashboard as in the first example
            with added filter only to California (this also respects the filters set on the Dashboard itself,
            if you do not want that, see the previous example).
        </p>

        <ExampleWithSource
            for={DashboardViewWithMergedFilters}
            source={DashboardViewWithMergedFiltersSRC}
            sourceJS={DashboardViewWithMergedFiltersSRCJS}
        />

        <hr className="separator" />

        <p>
            Example of how to embed a Dashboard into your application with added drilling – the same Dashboard
            as in the previous examples with Daly City with enabled drilling (check the console logs for
            results).
        </p>

        <ExampleWithSource
            for={DashboardViewWithDrilling}
            source={DashboardViewWithDrillingSRC}
            sourceJS={DashboardViewWithDrillingSRCJS}
        />

        <hr className="separator" />

        <p>Example of how to embed a Dashboard into your application with the option to schedule emails.</p>

        <ExampleWithSource
            for={DashboardViewWithEmails}
            source={DashboardViewWithEmailsSRC}
            sourceJS={DashboardViewWithEmailsSRCJS}
        />

        <hr className="separator" />

        <p>Example of how to customize rendering of the dashboard widgets.</p>

        <ExampleWithSource
            for={CustomDashboardView}
            source={CustomDashboardViewSRC}
            sourceJS={CustomDashboardViewSRCJS}
        />

        <p>
            Example of how to export a dashboard. This will export the dashboard in the first example to PDF.
        </p>

        <ExampleWithSource
            for={DashboardExport}
            source={DashboardExportSRC}
            sourceJS={DashboardExportSRCJS}
        />
    </div>
);
