import React from 'react';
import { Link } from 'react-router-dom';

import { version } from '../../package.json';

import ExampleWithSource from '../utils/ExampleWithSource';

import KpiExample from '../components/KpiExample';
import VisualizationTable from '../components/VisualizationTableExample';
import ColumnChartExample from '../components/ColumnChartExample';

import KpiExampleSRC from '!raw-loader!../components/KpiExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationTableSRC from '!raw-loader!../components/VisualizationTableExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import ColumnChartExampleSRC from '!raw-loader!../components/ColumnChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const Home = () => (
    <div>
        <h1>GoodData examples for React Components v{version}</h1>

        <p>You can find <a href="https://github.com/gooddata/gooddata-react-components">GoodData React Component</a> examples here.</p>

        <h2>KPI</h2>
        <ExampleWithSource for={KpiExample} source={KpiExampleSRC} />

        <h2>Column Chart</h2>
        <ExampleWithSource for={ColumnChartExample} source={ColumnChartExampleSRC} />
        <p><Link to="/basic-components">All basic component examples</Link></p>

        <h2>Table</h2>
        <ExampleWithSource for={VisualizationTable} source={VisualizationTableSRC} />
        <p><Link to="/visualization">All visualization examples</Link></p>
    </div>
);

export default Home;
