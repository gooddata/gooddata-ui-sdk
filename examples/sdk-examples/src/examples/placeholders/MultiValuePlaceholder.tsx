// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import MultiValuePlaceholder from "./MultiValuePlaceholderSrc";
import MultiValuePlaceholderSRC from "./MultiValuePlaceholderSrc?raw";
import MultiValuePlaceholderSRCJS from "./MultiValuePlaceholderSrc?rawJS";

const MultiValuePlaceholderExample = (): JSX.Element => (
    <div>
        <h1>Multi-Value Placeholder</h1>

        <p>Example of using a placeholder instead of the actual value and getting / setting its value.</p>

        <ExampleWithSource
            for={MultiValuePlaceholder}
            source={MultiValuePlaceholderSRC}
            sourceJS={MultiValuePlaceholderSRCJS}
        />
    </div>
);

export default MultiValuePlaceholderExample;
