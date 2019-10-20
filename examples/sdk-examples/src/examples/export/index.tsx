// (C) 2007-2019 GoodData Corporation
import React from "react";

import ExampleWithSource from "../../components/ExampleWithSource";
import BarChartExportExample from "./BarChartExportExample";
import TableExportExample from "./TableExportExample";
import PivotTableExportExample from "./PivotTableExportExample";
import VisualizationColumnChartExportExample from "./VisualizationColumnChartExportExample";
import HeadlineExportExample from "./HeadlineExportExample";

import BarChartExportExampleSRC from "!raw-loader!./BarChartExportExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import TableExportExampleSRC from "!raw-loader!./TableExportExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import PivotTableExportExampleSRC from "!raw-loader!./PivotTableExportExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationColumnChartExportExampleSRC from "!raw-loader!./VisualizationColumnChartExportExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import HeadlineExportExampleSRC from "!raw-loader!./HeadlineExportExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const Export = () => (
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

        <h2>Export Table Data</h2>
        <ExampleWithSource for={TableExportExample} source={TableExportExampleSRC} />

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

        <h2>Export Headline Data</h2>
        <ExampleWithSource for={HeadlineExportExample} source={HeadlineExportExampleSRC} />
    </div>
);
