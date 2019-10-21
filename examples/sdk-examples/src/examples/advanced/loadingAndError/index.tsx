// (C) 2007-2019 GoodData Corporation
import React from "react";

import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { LoadingExample } from "./LoadingExample";
import LoadingExampleSRC from "!raw-loader!./LoadingExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

import { CustomisedLoadingExample } from "./CustomisedLoadingExample";
import CustomisedLoadingExampleSRC from "!raw-loader!./CustomisedLoadingExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

import { ErrorExample } from "./ErrorExample";
import ErrorExampleSRC from "!raw-loader!./ErrorExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const LoadingAndError: React.FC = () => (
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
