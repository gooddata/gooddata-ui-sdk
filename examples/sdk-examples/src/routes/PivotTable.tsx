// (C) 2007-2019 GoodData Corporation
import React from "react";

import ExampleWithSource from "../components/utils/ExampleWithSource";
import { PivotTableExample } from "../components/PivotTableExample";
import PivotTableExampleSRC from "!raw-loader!../components/PivotTableExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

const PivotTableWithAttributesWithMeasuresWithPivot: React.FC = () => (
    <PivotTableExample
        withAttributes={true}
        withMeasures={true}
        withPivot={true}
        className="s-measures-row-attributes-and-column-attributes"
    />
);

const PivotTableWithMeasuresWithPivot: React.FC = () => (
    <PivotTableExample withMeasures={true} withPivot={true} className="s-measures-and-column-attributes" />
);

const PivotTableWithAttributesWithMeasures: React.FC = () => (
    <PivotTableExample withAttributes={true} withMeasures={true} className="s-measures-and-attributes" />
);

const PivotTableWithMeasures: React.FC = () => (
    <PivotTableExample withMeasures={true} className="s-measures-only" />
);

const PivotTableWithAttributes: React.FC = () => (
    <PivotTableExample withAttributes={true} className="s-row-attributes-only" />
);

const PivotTableWithError: React.FC = () => <PivotTableExample hasError={true} className="s-error" />;

export const PivotTable: React.FC = () => (
    <div>
        <h1>Pivot Table</h1>

        <hr className="separator" />

        <h2 id="measures-row-attributes-and-column-attributes">
            Measures, row attributes and column attributes
        </h2>
        <ExampleWithSource
            for={PivotTableWithAttributesWithMeasuresWithPivot}
            source={PivotTableExampleSRC}
        />

        <hr className="separator" />

        <h2 id="measures-and-column-attributes">Measures and column attributes</h2>
        <ExampleWithSource for={PivotTableWithMeasuresWithPivot} source={PivotTableExampleSRC} />

        <hr className="separator" />

        <h2 id="measures-and-attributes">Measures and row attributes</h2>
        <ExampleWithSource for={PivotTableWithAttributesWithMeasures} source={PivotTableExampleSRC} />

        <hr className="separator" />

        <h2 id="measures-only">Measures only</h2>
        <ExampleWithSource for={PivotTableWithMeasures} source={PivotTableExampleSRC} />

        <hr className="separator" />

        <h2 id="row-attributes-only">Row attributes only</h2>
        <ExampleWithSource for={PivotTableWithAttributes} source={PivotTableExampleSRC} />

        <hr className="separator" />

        <h2 id="error">Error</h2>
        <ExampleWithSource for={PivotTableWithError} source={PivotTableExampleSRC} />
    </div>
);
