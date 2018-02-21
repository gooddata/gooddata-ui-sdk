import React from 'react';

import ExampleWithSource from '../utils/ExampleWithSource';

import VisualizationColumnChart from '../components/VisualizationColumnChartExample';
import VisualizationTable from '../components/VisualizationTableExample';
import CustomVisualizationExample from '../components/CustomVisualizationExample';

import VisualizationColumnChartSRC from '!raw-loader!../components/VisualizationColumnChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationTableSRC from '!raw-loader!../components/VisualizationTableExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import CustomVisualizationExampleSRC from '!raw-loader!../components/CustomVisualizationExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const Visualization = () => (
    <div>
        <h1>Visualization</h1>

        <p>These are examples of generic Visualization component use cases.</p>

        <h2>Visualization Column Chart</h2>
        <ExampleWithSource for={VisualizationColumnChart} source={VisualizationColumnChartSRC} />

        <h2>Table</h2>
        <ExampleWithSource for={VisualizationTable} source={VisualizationTableSRC} />

        <h2>Custom Visualization</h2>
        <p>Using <a href="https://github.com/recharts/recharts">Recharts library</a></p>
        <ExampleWithSource for={CustomVisualizationExample} source={CustomVisualizationExampleSRC} />
    </div>
);

export default Visualization;
