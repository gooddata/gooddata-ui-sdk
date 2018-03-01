import React from 'react';
import ExampleWithSource from '../components/utils/ExampleWithSource';

import BarChartExample from '../components/BarChartExample';
import ColumnChartExample from '../components/ColumnChartExample';
import LineChartExample from '../components/LineChartExample';
import PieChartExample from '../components/PieChartExample';
import TableExample from '../components/TableExample';

import BarChartExampleSRC from '!raw-loader!../components/BarChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import ColumnChartExampleSRC from '!raw-loader!../components/ColumnChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import LineChartExampleSRC from '!raw-loader!../components/LineChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import PieChartExampleSRC from '!raw-loader!../components/PieChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import TableExampleSRC from '!raw-loader!../components/TableExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const title = 'Basic Components';

export const BasicComponents = () => (
    <div>
        <h1>{title}</h1>

        <p>These components ingest AFM, execute it and render data as a chart or table.</p>

        <hr className="separator" />

        <h2 id="bar-chart">Bar chart</h2>
        <ExampleWithSource for={BarChartExample} source={BarChartExampleSRC} />

        <hr className="separator" />

        <h2 id="column-chart">Column chart</h2>
        <ExampleWithSource for={ColumnChartExample} source={ColumnChartExampleSRC} />

        <hr className="separator" />

        <h2 id="line-chart">Line chart with custom colors</h2>
        <ExampleWithSource for={LineChartExample} source={LineChartExampleSRC} />

        <hr className="separator" />

        <h2 id="pie-chart">Pie chart</h2>
        <ExampleWithSource for={PieChartExample} source={PieChartExampleSRC} />

        <hr className="separator" />

        <h2 id="table">Table</h2>
        <ExampleWithSource for={TableExample} source={TableExampleSRC} />

    </div>
);

export default BasicComponents;
