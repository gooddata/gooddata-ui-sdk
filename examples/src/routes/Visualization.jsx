import React from 'react';

import Layout from '../components/Layout';
import ExampleWithSource from '../utils/ExampleWithSource';

import VisualizationColumnChart from '../components/VisualizationColumnChart';
import VisualizationTable from '../components/VisualizationTable';
import CustomVisualizationExample from '../components/CustomVisualizationExample';

import VisualizationColumnChartSRC from '!raw-loader!../components/VisualizationColumnChart'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationTableSRC from '!raw-loader!../components/VisualizationTable'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import CustomVisualizationExampleSRC from '!raw-loader!../components/CustomVisualizationExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const Visualization = props => (<Layout {...props} >
    <h1>Visualization</h1>

    <p>These are examples of generic Visualization component use cases.</p>

    <h2>Visualization Column Chart</h2>
    <ExampleWithSource for={VisualizationColumnChart} source={VisualizationColumnChartSRC} />

    <h2>Table</h2>
    <ExampleWithSource for={VisualizationTable} source={VisualizationTableSRC} />

    <h2>Custom Visualization</h2>
    <ExampleWithSource for={CustomVisualizationExample} source={CustomVisualizationExampleSRC} />
</Layout>);

export default Visualization;
