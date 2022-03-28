// (C) 2007-2022 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import ExecuteInsight from "./ExecuteInsightSrc";
import ExecuteInsightSRC from "./ExecuteInsightSrc?raw";
import ExecuteInsightSRCJS from "./ExecuteInsightSrc?rawJS";

const ExecuteInsightComponent = (): JSX.Element => (
    <div>
        <h1>ExecuteInsight</h1>
        <p>
            The ExecuteInsight component allows you to trigger execution for particular insight and send its
            result to the function that you have chosen to use and have implemented. The result passed to to
            your function provides convenience functions to access the computed data points.
        </p>

        <hr className="separator" />

        <p>
            This example of ExecuteInsight component shows how to obtain data for existing insight and render
            them with custom table.
        </p>

        <ExampleWithSource for={ExecuteInsight} source={ExecuteInsightSRC} sourceJS={ExecuteInsightSRCJS} />
    </div>
);

export default ExecuteInsightComponent;
