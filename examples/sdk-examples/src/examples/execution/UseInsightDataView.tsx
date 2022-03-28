// (C) 2007-2022 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import UseInsightDataView from "./UseInsightDataViewSrc";
import UseInsightDataViewSRC from "./UseInsightDataViewSrc?raw";
import UseInsightDataViewSRCJS from "./UseInsightDataViewSrc?rawJS";

const UseInsightDataViewHook = (): JSX.Element => (
    <div>
        <h1>useInsightDataView</h1>
        <p>
            useInsightDataView hook is an alternative to ExecuteInsight component. The advantage of this hook
            over ExecuteInsight component is that it does not depend on rendering, and it
            {"'"}s easier to compose it with other hooks. It{"'"}s useful for dealing with more complex use
            cases and data flows (for example, to prevent nested ExecuteInsight components when one execution
            depends on another).
        </p>

        <hr className="separator" />

        <p>
            This example of useInsightDataView hook shows how to obtain data for existing insight and render
            them with custom table.
        </p>

        <ExampleWithSource
            for={UseInsightDataView}
            source={UseInsightDataViewSRC}
            sourceJS={UseInsightDataViewSRCJS}
        />
    </div>
);

export default UseInsightDataViewHook;
