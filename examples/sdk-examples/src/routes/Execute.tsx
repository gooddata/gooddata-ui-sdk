// (C) 2007-2019 GoodData Corporation
import React from "react";

import { ExecuteExample } from "../components/ExecuteExample";
import ExecuteAttributeValuesExample from "../components/ExecuteAttributeValuesExample";
import ExampleWithSource from "../components/utils/ExampleWithSource";

import ExecuteExampleSRC from "!raw-loader!../components/ExecuteExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import ExecuteAttributeValuesExampleSRC from "!raw-loader!../components/ExecuteAttributeValuesExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const Execute: React.FC = () => (
    <div>
        <h1>Execute</h1>

        <p>
            The Execute component allows you to execute input data and send it to the function that you have
            chosen to use and have implemented. You can use the Execute component, for example, to create a
            report using an arbitrary chart library.
        </p>
        <p>Pass a custom children function to this component to render AFM execution data.</p>

        <hr className="separator" />

        <ExampleWithSource for={ExecuteExample} source={ExecuteExampleSRC} />
        {/* 
        <hr className="separator" />

        <h2>Execute attribute values only</h2>
        <p>To get values of a single attribute, use the AttributeElements component instead.</p>

        <hr className="separator" />

        <ExampleWithSource for={ExecuteAttributeValuesExample} source={ExecuteAttributeValuesExampleSRC} /> */}
    </div>
);

export default Execute;
