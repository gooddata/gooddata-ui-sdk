// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";
import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { ResponsiveExample } from "./ResponsiveExample";
import ResponsiveExampleSRC from "./ResponsiveExample?raw";
import ResponsiveExampleSRCJS from "./ResponsiveExample?rawJS";

export const Responsive: React.FC = () => (
    <div>
        <h1>Responsive Chart</h1>

        <p>
            By default, all insightViews are responsive and get properly resized when you resize the viewport.
            However, when you resize the chart container without resizing the viewport, the chart might get
            clipped. In this case, set chart dimensions either explicitly or dynamically using the Measure
            component or equivalent.
        </p>

        <ExampleWithSource
            for={ResponsiveExample}
            source={ResponsiveExampleSRC}
            sourceJS={ResponsiveExampleSRCJS}
        />
    </div>
);
