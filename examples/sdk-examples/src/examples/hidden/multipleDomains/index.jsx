// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { MultipleDomainsExample } from "./MultipleDomainsExample";
import MultipleDomainsExampleSRC from "./MultipleDomainsExample.jsx?raw";

export const MultipleDomains = () => (
    <div>
        <h1>Multiple domains (multiple SDKs)</h1>

        <ExampleWithSource for={MultipleDomainsExample} source={MultipleDomainsExampleSRC} />
    </div>
);
