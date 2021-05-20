// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import ComposedPlaceholder from "./ComposedPlaceholderSrc";
import ComposedPlaceholderSRC from "./ComposedPlaceholderSrc?raw";
import ComposedPlaceholderSRCJS from "./ComposedPlaceholderSrc?rawJS";

const ComposedPlaceholderExample = (): JSX.Element => (
    <div>
        <h1>Composed Placeholder</h1>

        <p>Example of placeholder with value derived from other placeholders.</p>

        <ExampleWithSource
            for={ComposedPlaceholder}
            source={ComposedPlaceholderSRC}
            sourceJS={ComposedPlaceholderSRCJS}
        />
    </div>
);

export default ComposedPlaceholderExample;
