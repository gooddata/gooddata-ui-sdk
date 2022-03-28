// (C) 2007-2022 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import UseExecutionDataView from "./UseExecutionDataViewSrc";
import UseExecutionDataViewSRC from "./UseExecutionDataViewSrc?raw";
import UseExecutionDataViewSRCJS from "./UseExecutionDataViewSrc?rawJS";

const UseExecutionDataViewHook = (): JSX.Element => (
    <div>
        <h1>useExecutionDataView</h1>

        <p>
            useExecutionDataView hook is an alternative to Execute &amp; RawExecute components. The advantage
            of this hook over these components is that it do not depend on rendering, and it
            {"'"}s easier to compose it with other hooks. It{"'"}s useful for dealing with more complex use
            cases and data flows (for example, to prevent nested Execute components when one execution depends
            on another).
        </p>

        <hr className="separator" />

        <p>
            This example of useExecutionDataView hook shows how to obtain a single formatted value and use it
            as a custom-made KPI.
        </p>

        <ExampleWithSource
            for={UseExecutionDataView}
            source={UseExecutionDataViewSRC}
            sourceJS={UseExecutionDataViewSRCJS}
        />
    </div>
);

export default UseExecutionDataViewHook;
