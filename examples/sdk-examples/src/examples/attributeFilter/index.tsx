// (C) 2007-2022 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import AttributeFilterComponentExample from "./AttributeFilterComponentExample";
import AttributeFilterExample from "./AttributeFilterExample";
import AttributeFilterButtonExample from "./AttributeFilterButtonExample";
import { AttributeParentChildFilterExample } from "./AttributeParentChildFilterExample";
import { AttributeParentChildFilterButtonExample } from "./AttributeParentChildFilterButtonExample";
import { AttributeParentChildFilterButtonWithPlaceholderExample } from "./AttributeParentChildFilterButtonWithPlaceholderExample";

import AttributeFilterComponentExampleSRC from "./AttributeFilterComponentExample?raw";
import AttributeFilterExampleSRC from "./AttributeFilterExample?raw";
import AttributeFilterButtonExampleSRC from "./AttributeFilterButtonExample?raw";
import AttributeParentChildFilterExampleSRC from "./AttributeParentChildFilterExample?raw";
import AttributeParentChildFilterButtonExampleSRC from "./AttributeParentChildFilterButtonExample?raw";
import AttributeParentChildFilterButtonWithPlaceholderExampleSRC from "./AttributeParentChildFilterButtonWithPlaceholderExample?raw";

import AttributeFilterComponentExampleSRCJS from "./AttributeFilterComponentExample?rawJS";
import AttributeFilterExampleSRCJS from "./AttributeFilterExample?rawJS";
import AttributeFilterButtonExampleSRCJS from "./AttributeFilterButtonExample?rawJS";
import AttributeParentChildFilterExampleSRCJS from "./AttributeParentChildFilterExample?rawJS";
import AttributeParentChildFilterButtonExampleSRCJS from "./AttributeParentChildFilterButtonExample?rawJS";
import AttributeParentChildFilterButtonWithPlaceholderExampleSRCJS from "./AttributeParentChildFilterButtonWithPlaceholderExample?rawJS";

export const AttributeFilter = (): JSX.Element => (
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

        <h2>AttributeFilterButton Component</h2>

        <ExampleWithSource
            for={AttributeFilterButtonExample}
            source={AttributeFilterButtonExampleSRC}
            sourceJS={AttributeFilterButtonExampleSRCJS}
        />

        <hr className="separator" />

        <h2>Parent-Child AttributeFilter</h2>

        <p>
            Pass parent filter via parentFilters property and attribute over which should be the child filter
            reduced via parentFilterOverAttribute property to create parent-child dependency between filters.
        </p>

        <p>
            Parent child dependency between filters can be implemented via placeholders. See{" "}
            <i>Parent-Child AttributeFilterButton with placeholders</i> below.
        </p>

        <p>
            <strong>
                Current limitation is that the parent filter must specify attribute elements using their URIs.
            </strong>
        </p>

        <ExampleWithSource
            for={AttributeParentChildFilterExample}
            source={AttributeParentChildFilterExampleSRC}
            sourceJS={AttributeParentChildFilterExampleSRCJS}
        />

        <hr className="separator" />

        <h2>Parent-Child AttributeFilterButton</h2>

        <p>
            Pass parent filter via parentFilters property and attribute over which should be the child filter
            reduced via parentFilterOverAttribute property to create parent-child dependency between filters.
        </p>

        <p>
            <strong>
                Current limitation is that the parent filter must specify attribute elements using their URIs.
            </strong>
        </p>

        <ExampleWithSource
            for={AttributeParentChildFilterButtonExample}
            source={AttributeParentChildFilterButtonExampleSRC}
            sourceJS={AttributeParentChildFilterButtonExampleSRCJS}
        />

        <hr className="separator" />

        <h2>Parent-Child AttributeFilterButton with placeholders</h2>

        <p>
            Pass placeholder for parent filter via parentFilters property and attribute over which should be
            the child filter reduced via parentFilterOverAttribute property to create parent-child dependency
            between filters.
        </p>

        <p>
            Dependency between parent filter and child filter is implemented via Placeholders and there is
            preselect value for parent filter demonstrated in this example.
        </p>

        <p>
            <strong>
                Current limitation is that the parent filter must specify attribute elements using their URIs.
            </strong>
        </p>

        <ExampleWithSource
            for={AttributeParentChildFilterButtonWithPlaceholderExample}
            source={AttributeParentChildFilterButtonWithPlaceholderExampleSRC}
            sourceJS={AttributeParentChildFilterButtonWithPlaceholderExampleSRCJS}
        />
    </div>
);
