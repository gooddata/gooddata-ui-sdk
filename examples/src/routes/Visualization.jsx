// (C) 2007-2018 GoodData Corporation
import React from 'react';

import ExampleWithSource from '../components/utils/ExampleWithSource';

import VisualizationColumnChartExample from '../components/VisualizationColumnChartExample';
import VisualizationTableExample from '../components/VisualizationTableExample';
import CustomVisualizationExample from '../components/CustomVisualizationExample';

import VisualizationColumnChartExampleSRC from '!raw-loader!../components/VisualizationColumnChartExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationTableExampleSRC from '!raw-loader!../components/VisualizationTableExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import CustomVisualizationExampleSRC from '!raw-loader!../components/CustomVisualizationExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const Visualization = () => (
    <div>
        <h1>Visualization</h1>

        <p>These are examples of the generic Visualization component.</p>

        <hr className="separator" />

        <h2 id="column-chart">Visualization Column Chart</h2>
        <ExampleWithSource for={VisualizationColumnChartExample} source={VisualizationColumnChartExampleSRC} />

        <hr className="separator" />

        <h2 id="table">Table</h2>
        <ExampleWithSource for={VisualizationTableExample} source={VisualizationTableExampleSRC} />

        <hr className="separator" />

        <h2 id="custom">Custom Visualization</h2>
        <p>Using <a href="https://github.com/recharts/recharts">Recharts library</a></p>
        <ExampleWithSource for={CustomVisualizationExample} source={CustomVisualizationExampleSRC} />
    </div>
);

export default Visualization;
