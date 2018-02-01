import React from 'react';
import Layout from '../components/Layout';
import ExampleWithSource from '../utils/ExampleWithSource';

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

export const title = 'Chart types';

export const ChartTypes = props => (<Layout {...props} >
    <h1>{title}</h1>

    <h2>Bar chart</h2>
    <ExampleWithSource for={BarChartExample} source={BarChartExampleSRC} />

    <h2>Column chart</h2>
    <ExampleWithSource for={ColumnChartExample} source={ColumnChartExampleSRC} />

    <h2>Line chart</h2>
    <ExampleWithSource for={LineChartExample} source={LineChartExampleSRC} />

    <h2>Pie chart</h2>
    <ExampleWithSource for={PieChartExample} source={PieChartExampleSRC} />

    <h2>Table</h2>
    <ExampleWithSource for={TableExample} source={TableExampleSRC} />

</Layout>);

export default ChartTypes;
