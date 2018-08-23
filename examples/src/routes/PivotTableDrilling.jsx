// (C) 2007-2018 GoodData Corporation
import React from 'react';

import ExampleWithSource from '../components/utils/ExampleWithSource';
import PivotTableDrillingExample from '../components/PivotTableDrillingExample';
import PivotTableDrillingExampleSRC from '!raw-loader!../components/PivotTableDrillingExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const PivotTableDrilling = () => (
    <div>
        <h1>Pivot Table Drilling</h1>

        <hr className="separator" />

        <ExampleWithSource
            for={() => (
                <PivotTableDrillingExample />
            )}
            source={PivotTableDrillingExampleSRC}
        />
    </div>
);

export default PivotTableDrilling;
