// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import SourceDropdown from "../../components/SourceDropdown";

import { ExampleWithSource } from "../../components/ExampleWithSource";
import { BarChartExportExample } from "./BarChartExportExample";
import { PivotTableExportExample } from "./PivotTableExportExample";
import { insightViewColumnChartExportExample } from "./InsightViewColumnChartExportExample";
import { HeadlineExportExample } from "./HeadlineExportExample";
import { ExecuteExportExample } from "./ExecuteExportExample";

import BarChartExportExampleSRC from "!raw-loader!./BarChartExportExample";
import PivotTableExportExampleSRC from "!raw-loader!./PivotTableExportExample";
import insightViewColumnChartExportExampleSRC from "!raw-loader!./InsightViewColumnChartExportExample";
import HeadlineExportExampleSRC from "!raw-loader!./HeadlineExportExample";
import ExecuteExportExampleSRC from "!raw-loader!./ExecuteExportExample";
import ExampleWithExportSRC from "!raw-loader!./ExampleWithExport";

import BarChartExportExampleSRCJS from "!raw-loader!../../../examplesJS/export/BarChartExportExample";
import PivotTableExportExampleSRCJS from "!raw-loader!../../../examplesJS/export/PivotTableExportExample";
import insightViewColumnChartExportExampleSRCJS from "!raw-loader!../../../examplesJS/export/InsightViewColumnChartExportExample";
import HeadlineExportExampleSRCJS from "!raw-loader!../../../examplesJS/export/HeadlineExportExample";
import ExecuteExportExampleSRCJS from "!raw-loader!../../../examplesJS/export/ExecuteExportExample";
import ExampleWithExportSRCJS from "!raw-loader!../../../examplesJS/export/ExampleWithExport";

export const Export: React.FC = () => (
    <div>
        <h1>Export</h1>
        <p>
            Each visualization lets you specify <code>onExportReady</code> callback, which the visualization
            will call once it is rendered and its underlying data is ready for export. The value passed
            through the callback is a function that can be used to trigger the exports. This allows for
            integration with wrapper components that can trigger exports for any visualization. For examples,
            see the attached source code below.
        </p>
        <SourceDropdown source={ExampleWithExportSRC} sourceJS={ExampleWithExportSRCJS} />
        <p>
            These examples show how to export data for components like{" "}
            <code>ColumnChart, Table/Pivot Table or insightView</code>.
        </p>

        <hr className="separator" />

        <h2>Export Chart Data</h2>
        <ExampleWithSource
            for={BarChartExportExample}
            source={BarChartExportExampleSRC}
            sourceJS={BarChartExportExampleSRCJS}
        />

        <hr className="separator" />

        <h2>Export Pivot Table Data</h2>
        <ExampleWithSource
            for={PivotTableExportExample}
            source={PivotTableExportExampleSRC}
            sourceJS={PivotTableExportExampleSRCJS}
        />

        <hr className="separator" />

        <h2>Export insightView Data</h2>
        <ExampleWithSource
            for={insightViewColumnChartExportExample}
            source={insightViewColumnChartExportExampleSRC}
            sourceJS={insightViewColumnChartExportExampleSRCJS}
        />

        <hr className="separator" />

        <h2>Export Headline Data</h2>
        <ExampleWithSource
            for={HeadlineExportExample}
            source={HeadlineExportExampleSRC}
            sourceJS={HeadlineExportExampleSRCJS}
        />

        <hr className="separator" />

        <h2>Export Execute Data</h2>
        <ExampleWithSource
            for={ExecuteExportExample}
            source={ExecuteExportExampleSRC}
            sourceJS={ExecuteExportExampleSRCJS}
        />
    </div>
);
