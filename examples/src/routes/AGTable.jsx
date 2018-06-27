// (C) 2007-2018 GoodData Corporation
import React from 'react';

import ExampleWithSource from '../components/utils/ExampleWithSource';

import AGTableExample from '../components/AGTableExample';

import AGTableExampleSRC from '!raw-loader!../components/AGTableExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const AGTable = () => (
    <div>
        <h1>AG Table</h1>

        <hr className="separator" />

        <h2 id="bar-chart">Measures and attributes</h2>
        <ExampleWithSource for={() => <AGTableExample withAttributes withMeasures />} source={AGTableExampleSRC} />

        <hr className="separator" />

        <h2 id="column-chart">Measures only</h2>
        <ExampleWithSource for={() => <AGTableExample withMeasures />} source={AGTableExampleSRC} />

        <hr className="separator" />


        <h2 id="column-chart">Attributes only</h2>
        <ExampleWithSource for={() => <AGTableExample withAttributes />} source={AGTableExampleSRC} />

        <h2 id="column-chart">Pivot table</h2>
        <ExampleWithSource
            for={() =>
                (<AGTableExample
                    withAttributes
                    withMeasures
                    withPivot
                />)
            }
            source={AGTableExampleSRC}
        />

        <h2 id="column-chart">Pivot table without row attributes</h2>
        <ExampleWithSource
            for={() => (<AGTableExample
                withMeasures
                withPivot
            />)}
            source={AGTableExampleSRC}
        />

        {/* <h2 id="column-chart">Table with totals</h2> */}
        {/* <ExampleWithSource for={AGTableExample} source={AGTableExampleSRC} /> */}
    </div>
);

export default AGTable;
