// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { LoadingExample } from "./LoadingExample";
import LoadingExampleSRC from "./LoadingExample?raw";
import LoadingExampleSRCJS from "./LoadingExample?rawJS";

import { CustomisedLoadingExample } from "./CustomisedLoadingExample";
import CustomisedLoadingExampleSRC from "./CustomisedLoadingExample?raw";
import CustomisedLoadingExampleSRCJS from "./CustomisedLoadingExample?rawJS";

import { ErrorExample } from "./ErrorExample";
import ErrorExampleSRC from "./ErrorExample?raw";
import ErrorExampleSRCJS from "./ErrorExample?rawJS";

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
