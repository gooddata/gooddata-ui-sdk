// (C) 2007-2019 GoodData Corporation
import React from "react";

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

import BarChartExportExampleSRCJS from "!raw-loader!../../../examplesJS/export/BarChartExportExample";
import PivotTableExportExampleSRCJS from "!raw-loader!../../../examplesJS/export/PivotTableExportExample";
import insightViewColumnChartExportExampleSRCJS from "!raw-loader!../../../examplesJS/export/InsightViewColumnChartExportExample";
import HeadlineExportExampleSRCJS from "!raw-loader!../../../examplesJS/export/HeadlineExportExample";
import ExecuteExportExampleSRCJS from "!raw-loader!../../../examplesJS/export/ExecuteExportExample";

export const Export: React.FC = () => (
    <div>
        <h1>Export</h1>
        <p>
            These examples show how to export data for components like
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
