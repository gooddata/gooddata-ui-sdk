// (C) 2007-2019 GoodData Corporation
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";
import { BarChartExportExample } from "./BarChartExportExample";
import { PivotTableExportExample } from "./PivotTableExportExample";
import { insightViewColumnChartExportExample } from "./InsightViewColumnChartExportExample";
// import HeadlineExportExample from "./HeadlineExportExample";

import BarChartExportExampleSRC from "!raw-loader!./BarChartExportExample";
import PivotTableExportExampleSRC from "!raw-loader!./PivotTableExportExample";
import insightViewColumnChartExportExampleSRC from "!raw-loader!./InsightViewColumnChartExportExample";
// import HeadlineExportExampleSRC from "!raw-loader!./HeadlineExportExample";

export const Export: React.FC = () => (
    <div>
        <h1>Export</h1>
        <p>
            These examples show how to export data for components like
            <code>ColumnChart, Table/Pivot Table or insightView</code>.
        </p>

        <hr className="separator" />

        <h2>Export Chart Data</h2>
        <ExampleWithSource for={BarChartExportExample} source={BarChartExportExampleSRC} />

        <hr className="separator" />

        <h2>Export Pivot Table Data</h2>
        <ExampleWithSource for={PivotTableExportExample} source={PivotTableExportExampleSRC} />

        <hr className="separator" />

        <h2>Export insightView Data</h2>
        <ExampleWithSource
            for={insightViewColumnChartExportExample}
            source={insightViewColumnChartExportExampleSRC}
        />

        <hr className="separator" />
        {/* 
        <h2>Export Headline Data</h2>
        <ExampleWithSource for={HeadlineExportExample} source={HeadlineExportExampleSRC} />  */}
    </div>
);
