import React from 'react';
import { Link } from 'react-router-dom';

import Layout from '../components/Layout';
import ExampleWithSource from '../utils/ExampleWithSource';

import KpiExample from '../components/KpiExample';
import VisualizationTable from '../components/VisualizationTable';
import VisualizationColumnChart from '../components/VisualizationColumnChart';

import KpiExampleSRC from '!raw-loader!../components/KpiExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationTableSRC from '!raw-loader!../components/VisualizationTable'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationColumnChartSRC from '!raw-loader!../components/VisualizationColumnChart'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const Home = props => (<Layout {...props} >
    <h1>GoodData React Components examples</h1>

    <p>
        You can find <a href="https://github.com/gooddata/gooddata-react-components">GoodData React Component</a> examples here.
    </p>

    <h2>KPI</h2>
    <ExampleWithSource for={KpiExample} source={KpiExampleSRC} />

    <h2>Table</h2>
    <ExampleWithSource for={VisualizationTable} source={VisualizationTableSRC} />

    <h2>Column Chart</h2>
    <ExampleWithSource for={VisualizationColumnChart} source={VisualizationColumnChartSRC} />

    <p><Link to="/visualization">All visualization examples</Link></p>
</Layout>);

export default Home;
