// (C) 2007-2019 GoodData Corporation
import React from "react";

import ExampleWithSource from "../components/utils/ExampleWithSource";

import AttributeFilterComponentExample from "../components/AttributeFilterComponentExample";
import AttributeElementsExample from "../components/AttributeElementsExample";
import AttributeFilterExample from "../components/AttributeFilterExample";

import AttributeFilterComponentExampleSRC from "!raw-loader!../components/AttributeFilterComponentExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import AttributeElementsExampleSRC from "!raw-loader!../components/AttributeElementsExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import AttributeFilterExampleSRC from "!raw-loader!../components/AttributeFilterExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const AttributeFilter = () => (
    <div>
        <h1>Attribute Filter Components</h1>

        <p>These examples show how to use the Attribute Filter components.</p>

        <hr className="separator" />

        <h2>Attribute Filter</h2>
        <p>
            You can render a styled dropdown with selectable attribute values using this Attribute Filter
            component.
        </p>
        <p>
            Pass a custom onApply function to this component to handle what happens when the user clicks the
            Apply button.
        </p>
        <ExampleWithSource
            for={AttributeFilterComponentExample}
            source={AttributeFilterComponentExampleSRC}
        />

        <hr className="separator" />

        <h2>Attribute Filter Example</h2>

        <p>This example shows how to add attribute filter component into a report.</p>

        <ExampleWithSource for={AttributeFilterExample} source={AttributeFilterExampleSRC} />

        <hr className="separator" />

        <h2>Custom Attribute Filter using Attribute Elements component</h2>
        <p>
            Pass a custom children function to this component to render the returned data using your custom
            components.
        </p>
        <p>
            The children function will receive isLoading state, possible error state, attribute metadata,
            paging, attribute values and a loadMore function.
        </p>
        <ExampleWithSource for={AttributeElementsExample} source={AttributeElementsExampleSRC} />
    </div>
);

export default AttributeFilter;
