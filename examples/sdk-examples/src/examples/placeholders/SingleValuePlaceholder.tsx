// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import SingleValuePlaceholder from "./SingleValuePlaceholderSrc";
import SingleValuePlaceholderSRC from "./SingleValuePlaceholderSrc?raw";
import SingleValuePlaceholderSRCJS from "./SingleValuePlaceholderSrc?rawJS";

const SingleValuePlaceholderExample = (): JSX.Element => (
    <div>
        <h1>Single Value Placeholder</h1>

        <p>Example of using a placeholder instead of the actual value and getting / setting its value.</p>

        <ExampleWithSource
            for={SingleValuePlaceholder}
            source={SingleValuePlaceholderSRC}
            sourceJS={SingleValuePlaceholderSRCJS}
        />
    </div>
);

export default SingleValuePlaceholderExample;
