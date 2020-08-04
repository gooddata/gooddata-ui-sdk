// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { LoadingExample } from "./LoadingExample";
import LoadingExampleSRC from "!raw-loader!./LoadingExample";
import LoadingExampleSRCJS from "!raw-loader!../../../../examplesJS/advanced/loadingAndError/LoadingExample";

import { CustomisedLoadingExample } from "./CustomisedLoadingExample";
import CustomisedLoadingExampleSRC from "!raw-loader!./CustomisedLoadingExample";
import CustomisedLoadingExampleSRCJS from "!raw-loader!../../../../examplesJS/advanced/loadingAndError/CustomisedLoadingExample";

import { ErrorExample } from "./ErrorExample";
import ErrorExampleSRC from "!raw-loader!./ErrorExample";
import ErrorExampleSRCJS from "!raw-loader!../../../../examplesJS/advanced/loadingAndError/ErrorExample";

export const LoadingAndError: React.FC = () => (
    <div>
        <h1>Loading and Error Components</h1>

        <p>These examples show how to use Loading and Error components.</p>

        <hr className="separator" />

        <h2>Default Loading Component</h2>
        <ExampleWithSource for={LoadingExample} source={LoadingExampleSRC} sourceJS={LoadingExampleSRCJS} />
        <hr className="separator" />

        <h2>Customised Loading Component</h2>
        <ExampleWithSource
            for={CustomisedLoadingExample}
            source={CustomisedLoadingExampleSRC}
            sourceJS={CustomisedLoadingExampleSRCJS}
        />

        <hr className="separator" />

        <h2>Error Component</h2>
        <ExampleWithSource for={ErrorExample} source={ErrorExampleSRC} sourceJS={ErrorExampleSRCJS} />
    </div>
);
