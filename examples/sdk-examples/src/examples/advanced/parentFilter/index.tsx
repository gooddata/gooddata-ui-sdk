// (C) 2007-2019 GoodData Corporation
import React from "react";

import { ExampleWithSource } from "../../../components/ExampleWithSource";

import ParentFilterExample from "./ParentFilterExample";
// eslint-disable-next-line import/no-unresolved
import ParentFilterExampleSRC from "!raw-loader!./ParentFilterExample";
import ParentFilterExampleSRCJS from "!raw-loader!../../../../examplesJS/advanced/parentFilter/ParentFilterExample";

export const ParentFilter = (): JSX.Element => (
    <div>
        <h1>Parent Filter Example</h1>

        <p>
            This example shows how to join two filters as parent-child filter so that values in the child
            filter are restricted by values of the parent filter.
        </p>

        <hr className="separator" />

        <ExampleWithSource
            for={ParentFilterExample}
            source={ParentFilterExampleSRC}
            sourceJS={ParentFilterExampleSRCJS}
        />
    </div>
);
