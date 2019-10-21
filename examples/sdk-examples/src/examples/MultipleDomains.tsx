// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ExampleWithSource } from "../components/ExampleWithSource";

import { MultipleDomainsExample } from "./MultipleDomainsExample";
import MultipleDomainsExampleSRC from "!raw-loader!./MultipleDomainsExample.jsx"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const MultipleDomains: React.FC = () => (
    <div>
        <h1>Multiple domains (multiple SDKs)</h1>

        <ExampleWithSource for={MultipleDomainsExample} source={MultipleDomainsExampleSRC} />
    </div>
);
