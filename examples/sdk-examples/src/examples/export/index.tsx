// (C) 2007-2019 GoodData Corporation
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";
import { BarChartExportExample } from "./BarChartExportExample";
import { PivotTableExportExample } from "./PivotTableExportExample";
import { VisualizationColumnChartExportExample } from "./VisualizationColumnChartExportExample";
// import HeadlineExportExample from "./HeadlineExportExample";

import BarChartExportExampleSRC from "!raw-loader!./BarChartExportExample";
import PivotTableExportExampleSRC from "!raw-loader!./PivotTableExportExample";
import VisualizationColumnChartExportExampleSRC from "!raw-loader!./VisualizationColumnChartExportExample";
// import HeadlineExportExampleSRC from "!raw-loader!./HeadlineExportExample";

export const Export: React.FC = () => (
    <div>
        <h1>Export</h1>
        <p>
            These examples show how to export data for components like
            <code>ColumnChart, Table/Pivot Table or Visualization</code>.
        </p>

        <hr className="separator" />

        <h2>Export Chart Data</h2>
        <ExampleWithSource for={BarChartExportExample} source={BarChartExportExampleSRC} />

        <hr className="separator" />

        <h2>Export Pivot Table Data</h2>
        <ExampleWithSource for={PivotTableExportExample} source={PivotTableExportExampleSRC} />

        <hr className="separator" />

        <h2>Export Visualization Data</h2>
        <ExampleWithSource
            for={VisualizationColumnChartExportExample}
            source={VisualizationColumnChartExportExampleSRC}
        />

        <hr className="separator" />
        {/* 
        <h2>Export Headline Data</h2>
        <ExampleWithSource for={HeadlineExportExample} source={HeadlineExportExampleSRC} />  */}
    </div>
);
