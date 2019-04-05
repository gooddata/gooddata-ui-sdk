// (C) 2007-2019 GoodData Corporation
import React from "react";

import ExampleWithSource from "../components/utils/ExampleWithSource";

import LoadingExample from "../components/LoadingExample";
import LoadingExampleSRC from "!raw-loader!../components/LoadingExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

import CustomisedLoadingExample from "../components/CustomisedLoadingExample";
import CustomisedLoadingExampleSRC from "!raw-loader!../components/CustomisedLoadingExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

import ErrorExample from "../components/ErrorExample";
import ErrorExampleSRC from "!raw-loader!../components/ErrorExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const LoadingAndError = () => (
    <div>
        <h1>Loading and Error Components</h1>

        <p>These examples show how to use Loading and Error components.</p>

        <hr className="separator" />

        <h2>Default Loading Component</h2>
        <ExampleWithSource for={LoadingExample} source={LoadingExampleSRC} />

        <hr className="separator" />

        <h2>Customised Loading Component</h2>
        <ExampleWithSource for={CustomisedLoadingExample} source={CustomisedLoadingExampleSRC} />

        <hr className="separator" />

        <h2>Error Component</h2>
        <ExampleWithSource for={ErrorExample} source={ErrorExampleSRC} />
    </div>
);

export default LoadingAndError;
