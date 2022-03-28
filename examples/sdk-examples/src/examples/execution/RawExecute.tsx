// (C) 2007-2022 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import RawExecute from "./RawExecuteSrc";
import RawExecuteSRC from "./RawExecuteSrc?raw";
import RawExecuteSRCJS from "./RawExecuteSrc?rawJS";

const RawExecuteComponent = (): JSX.Element => (
    <div>
        <h1>RawExecute</h1>
        <p>
            The RawExecute components allows you trigger execution and send its result to the function that
            you have chosen to use and have implemented. The RawExecute provides no guidelines and allows you
            to construct any execution you would like using the underlying backend APIs.
        </p>

        <hr className="separator" />

        <p>
            This example of RawExecute component shows how to obtain attribute values and render them with
            custom list.
        </p>

        <ExampleWithSource for={RawExecute} source={RawExecuteSRC} sourceJS={RawExecuteSRCJS} />
    </div>
);

export default RawExecuteComponent;
