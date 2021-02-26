// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";
import { Link } from "react-router-dom";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import DashboardExport from "./DashboardExportSrc";
import DashboardExportSRC from "!raw-loader!./DashboardExportSrc";
import DashboardExportSRCJS from "!raw-loader!../../../examplesJS/dashboardEmbedding/DashboardExportSrc";

const DashboardView = (): JSX.Element => (
    <div>
        <h1>DashboardView with export</h1>

        <p>
            Example of how to export a dashboard. This will export the dashboard in the{" "}
            <Link to="/dashboardView/simple">Simple example</Link> to PDF.
        </p>

        <ExampleWithSource
            for={DashboardExport}
            source={DashboardExportSRC}
            sourceJS={DashboardExportSRCJS}
        />
    </div>
);

export default DashboardView;
