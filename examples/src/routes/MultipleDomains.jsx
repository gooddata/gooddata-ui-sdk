// (C) 2007-2019 GoodData Corporation
import React from "react";
import ExampleWithSource from "../components/utils/ExampleWithSource";

import MultipleDomainsExample from "../components/MultipleDomainsExample";
import MultipleDomainsExampleSRC from "!raw-loader!../components/MultipleDomainsExample.jsx"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const MultipleDomains = () => (
    <div>
        <h1>Multiple domains (multiple SDKs)</h1>

        <ExampleWithSource for={MultipleDomainsExample} source={MultipleDomainsExampleSRC} />
    </div>
);

export default MultipleDomains;
