// (C) 2007-2018 GoodData Corporation
import React from 'react';

import ExampleWithSource from '../components/utils/ExampleWithSource';

import BarChartExample from '../components/BarChartExample';
import ColumnChartExample from '../components/ColumnChartExample';
import LineChartExample from '../components/LineChartExample';
import AreaChartExample from '../components/AreaChartExample';
import StackedAreaChartExample from '../components/StackedAreaChartExample';
import PieChartExample from '../components/PieChartExample';
import DonutChartExample from '../components/DonutChartExample';
import ComboChartExample from '../components/ComboChartExample';
import ScatterPlotExample from '../components/ScatterPlotExample';
import BubbleChartExample from '../components/BubbleChartExample';
import TreemapExample from '../components/TreemapExample';
import TableExample from '../components/TableExample';
import KpiExample from '../components/KpiExample';

import BarChartExampleSRC from '!raw-loader!../components/BarChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import ColumnChartExampleSRC from '!raw-loader!../components/ColumnChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import LineChartExampleSRC from '!raw-loader!../components/LineChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import AreaChartExampleSRC from '!raw-loader!../components/AreaChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import StackedAreaChartExampleSRC from '!raw-loader!../components/StackedAreaChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import PieChartExampleSRC from '!raw-loader!../components/PieChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import DonutChartExampleSRC from '!raw-loader!../components/DonutChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import ComboChartExampleSRC from '!raw-loader!../components/ComboChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import ScatterPlotExampleSRC from '!raw-loader!../components/ScatterPlotExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import BubbleChartExampleSRC from '!raw-loader!../components/BubbleChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import TreemapExampleSRC from '!raw-loader!../components/TreemapExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import TableExampleSRC from '!raw-loader!../components/TableExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import KpiExampleSRC from '!raw-loader!../components/KpiExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const BasicComponents = () => (
    <div>
        <h1>Basic Components</h1>

        <p>
            The following components accept measures and attributes,
            perform the execution, and render data as a chart, table or KPI.
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

        <hr className="separator" />

        <h2 id="table">Table</h2>
        <ExampleWithSource for={TableExample} source={TableExampleSRC} />

        <h2 id="kpi">KPI</h2>
        <p>
            The interface of the KPI component is different compared to the components above.
            It takes only one measure.
        </p>
        <ExampleWithSource for={KpiExample} source={KpiExampleSRC} />
    </div>
);

export default BasicComponents;
