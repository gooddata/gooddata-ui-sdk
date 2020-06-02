// (C) 2007-2019 GoodData Corporation
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import AttributeFilterComponentExample from "./AttributeFilterComponentExample";
import AttributeElementsExample from "./AttributeElementsExample";
import AttributeFilterExample from "./AttributeFilterExample";

import AttributeFilterComponentExampleSRC from "!raw-loader!./AttributeFilterComponentExample";
import AttributeElementsExampleSRC from "!raw-loader!./AttributeElementsExample";
import AttributeFilterExampleSRC from "!raw-loader!./AttributeFilterExample";

import AttributeFilterComponentExampleSRCJS from "!raw-loader!../../../examplesJS/attributeFilter/AttributeFilterComponentExample";
import AttributeElementsExampleSRCJS from "!raw-loader!../../../examplesJS/attributeFilter/AttributeElementsExample";
import AttributeFilterExampleSRCJS from "!raw-loader!../../../examplesJS/attributeFilter/AttributeFilterExample";

export const AttributeFilter = () => (
    <div>
        <h1>Attribute Filter Component</h1>

        <p>These examples show how to use the Attribute Filter component.</p>

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
        <p>
            NOTE: Accessing Attribute Filter through filter prop is preferred since identifier prop is
            deprecated.
        </p>
        <ExampleWithSource
            for={AttributeFilterComponentExample}
            source={AttributeFilterComponentExampleSRC}
            sourceJS={AttributeFilterComponentExampleSRCJS}
        />

        <hr className="separator" />

        <h2>Attribute Filter Example</h2>

        <p>This example shows how to add attribute filter component into a report.</p>

        <ExampleWithSource
            for={AttributeFilterExample}
            source={AttributeFilterExampleSRC}
            sourceJS={AttributeFilterExampleSRCJS}
        />

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
        <ExampleWithSource
            for={AttributeElementsExample}
            source={AttributeElementsExampleSRC}
            sourceJS={AttributeElementsExampleSRCJS}
        />
    </div>
);
