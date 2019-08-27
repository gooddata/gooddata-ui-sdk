// (C) 2007-2019 GoodData Corporation
import React from "react";

import ExampleWithSource from "../components/utils/ExampleWithSource";

import MeasureSortingExample from "../components/MeasureSortingExample";
import AttributeSortingExample from "../components/AttributeSortingExample";
import DynamicSortingExample from "../components/DynamicSortingExample";

import MeasureSortingExampleSRC from "!raw-loader!../components/MeasureSortingExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import AttributeSortingExampleSRC from "!raw-loader!../components/AttributeSortingExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import DynamicSortingExampleSRC from "!raw-loader!../components/DynamicSortingExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const Sorting = () => (
    <div>
        <h1>Sorting</h1>
        <p>
            These examples show how to sort bucket components like <code>ColumnChart or Table</code>.
        </p>

        <hr className="separator" />

        <h2>Sorting by Measure</h2>
        <p>
            You can sort data by a measure value with the <code>measureSortItem</code>.
        </p>
        <ExampleWithSource for={MeasureSortingExample} source={MeasureSortingExampleSRC} />

        <hr className="separator" />

        <h2>Sorting by Attribute</h2>
        <p>
            You can sort data by an attribute value with the <code>attributeSortItem</code> property.
        </p>
        <ExampleWithSource for={AttributeSortingExample} source={AttributeSortingExampleSRC} />

        <hr className="separator" />

        <h2>Dynamic Sorting</h2>
        <p>
            When sorting insights with multiple attributes in different dimensions by measure, specify an{" "}
            <code>attributeSortItem</code> with <code>aggregation: &apos;sum&apos;</code> or
            <code>measureSortItem</code> with an <code>attributeLocator</code> property. Sorting by an
            attribute value works the same way as in the previous example.
        </p>
        <ExampleWithSource for={DynamicSortingExample} source={DynamicSortingExampleSRC} />
    </div>
);

export default Sorting;
