// (C) 2007-2018 GoodData Corporation
import React from 'react';

import ExampleWithSource from '../components/utils/ExampleWithSource';
import PivotTableExample from '../components/PivotTableExample';
import PivotTableExampleSRC from '!raw-loader!../components/PivotTableExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const PivotTable = () => (
    <div>
        <h1>Pivot Table</h1>

        <hr className="separator" />

        <h2 id="measures-row-attributes-and-column-attributes">
            Measures, row attributes and column attributes
        </h2>
        <ExampleWithSource
            for={() => (
                <PivotTableExample withAttributes withMeasures withPivot className="s-measures-row-attributes-and-column-attributes" />
            )}
            source={PivotTableExampleSRC}
        />

        <hr className="separator" />

        <h2 id="measures-and-column-attributes">
            Measures and column attributes
        </h2>
        <ExampleWithSource
            for={() => <PivotTableExample withMeasures withPivot className="s-measures-and-column-attributes" />}
            source={PivotTableExampleSRC}
        />

        <hr className="separator" />

        <h2 id="measures-and-attributes">Measures and row attributes</h2>
        <ExampleWithSource
            for={() => <PivotTableExample withAttributes withMeasures className="s-measures-and-attributes" />}
            source={PivotTableExampleSRC}
        />

        <hr className="separator" />

        <h2 id="measures-only">Measures only</h2>
        <ExampleWithSource
            for={() => <PivotTableExample withMeasures className="s-measures-only" />}
            source={PivotTableExampleSRC}
        />

        <hr className="separator" />

        <h2 id="row-attributes-only">Row attributes only</h2>
        <ExampleWithSource
            for={() => <PivotTableExample withAttributes className="s-row-attributes-only" />}
            source={PivotTableExampleSRC}
        />

        <hr className="separator" />

        <h2 id="error">Error</h2>
        <ExampleWithSource
            for={() => <PivotTableExample hasError className="s-error" />}
            source={PivotTableExampleSRC}
        />
    </div>
);

export default PivotTable;
