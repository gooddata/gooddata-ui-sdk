// (C) 2007-2019 GoodData Corporation
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import { BarChartExample } from "./BarChartExample";
import { ColumnChartExample } from "./ColumnChartExample";
import { LineChartExample } from "./LineChartExample";
import { AreaChartExample } from "./AreaChartExample";
import { StackedAreaChartExample } from "./StackedAreaChartExample";
import { PieChartExample } from "./PieChartExample";
import { DonutChartExample } from "./DonutChartExample";
import { ComboChartExample } from "./ComboChartExample";
import { ScatterPlotExample } from "./ScatterPlotExample";
import { BubbleChartExample } from "./BubbleChartExample";
import { TreemapExample } from "./TreemapExample";
import { HeatmapExample } from "./HeatmapExample";
import { TableExample } from "./TableExample";
// import { HeadlineExample } from "../components/HeadlineExample";
import { KpiExample } from "./KpiExample";

import BarChartExampleSRC from "!raw-loader!./BarChartExample";
import ColumnChartExampleSRC from "!raw-loader!./ColumnChartExample";
import LineChartExampleSRC from "!raw-loader!./LineChartExample";
import AreaChartExampleSRC from "!raw-loader!./AreaChartExample";
import StackedAreaChartExampleSRC from "!raw-loader!./StackedAreaChartExample";
import PieChartExampleSRC from "!raw-loader!./PieChartExample";
import DonutChartExampleSRC from "!raw-loader!./DonutChartExample";
import ComboChartExampleSRC from "!raw-loader!./ComboChartExample";
import ScatterPlotExampleSRC from "!raw-loader!./ScatterPlotExample";
import BubbleChartExampleSRC from "!raw-loader!./BubbleChartExample";
import TreemapExampleSRC from "!raw-loader!./TreemapExample";
import HeatmapExampleSRC from "!raw-loader!./HeatmapExample";
import TableExampleSRC from "!raw-loader!./TableExample";
// import HeadlineExampleSRC from "!raw-loader!./HeadlineExample";
import KpiExampleSRC from "!raw-loader!./KpiExample";

export const BasicComponents: React.FC = () => (
    <div>
        <h1>Basic Components</h1>

        <p>
            The following components accept measures and attributes, perform the execution, and render data as
            a chart, table or KPI.
        </p>

        <hr className="separator" />

        <h2 id="bar-chart">Bar chart</h2>
        <ExampleWithSource for={BarChartExample} source={BarChartExampleSRC} />

        <hr className="separator" />

        <h2 id="column-chart">Column chart</h2>
        <ExampleWithSource for={ColumnChartExample} source={ColumnChartExampleSRC} />

        <hr className="separator" />

        <h2 id="line-chart">Line chart with custom colors</h2>
        <ExampleWithSource for={LineChartExample} source={LineChartExampleSRC} />

        <h2 id="area-chart">Area chart</h2>
        <ExampleWithSource for={AreaChartExample} source={AreaChartExampleSRC} />

        <h2 id="stacked-area-chart">Stacked area chart</h2>
        <ExampleWithSource for={StackedAreaChartExample} source={StackedAreaChartExampleSRC} />

        <hr className="separator" />

        <h2 id="pie-chart">Pie chart</h2>
        <ExampleWithSource for={PieChartExample} source={PieChartExampleSRC} />

        <h2 id="donut-chart">Donut chart</h2>
        <ExampleWithSource for={DonutChartExample} source={DonutChartExampleSRC} />

        <h2 id="combo-chart">Combo chart</h2>
        <ExampleWithSource for={ComboChartExample} source={ComboChartExampleSRC} />

        <h2 id="scatter-plot">Scatter plot</h2>
        <ExampleWithSource for={ScatterPlotExample} source={ScatterPlotExampleSRC} />

        <h2 id="bubble-chart">Bubble chart</h2>
        <ExampleWithSource for={BubbleChartExample} source={BubbleChartExampleSRC} />

        <h2 id="treemap">Treemap</h2>
        <ExampleWithSource for={TreemapExample} source={TreemapExampleSRC} />

        <h2 id="heatmap">Heatmap</h2>
        <ExampleWithSource for={HeatmapExample} source={HeatmapExampleSRC} />

        <hr className="separator" />

        <h2 id="table">Table</h2>
        <ExampleWithSource for={TableExample} source={TableExampleSRC} />

        {/* <h2 id="table">Headline</h2>
        <ExampleWithSource for={HeadlineExample} source={HeadlineExampleSRC} /> */}

        <h2 id="kpi">KPI</h2>
        <p>
            The interface of the KPI component is different compared to the components above. It takes only
            one measure.
        </p>

        <ExampleWithSource for={KpiExample} source={KpiExampleSRC} />
    </div>
);
