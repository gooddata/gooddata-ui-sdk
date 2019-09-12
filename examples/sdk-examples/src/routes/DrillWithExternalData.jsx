// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React from "react";
import ExampleWithSource from "../components/utils/ExampleWithSource";

import DrillWithExternalDataExample from "../components/DrillWithExternalDataExample";
import DrillWithExternalDataExampleSRC from "!raw-loader!../components/DrillWithExternalDataExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const DrillWithExternalData = () => (
    <div className="example-wrapper">
        {/* language=CSS */}
        <style jsx>{`
            .example-wrapper {
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: stretch;
                flex: 1 0 auto;
            }
        `}</style>
        <div>
            <h1>Drill With External Data</h1>
            <p>
                Here is how you can use visualization drilling to display 3rd party content based on the
                clicked item.
            </p>
            <p>
                You can display a mock user profile by clicking on an employee name. An request is created
                using the selected employee name and retrieves the mock employee information asynchroneously.
            </p>
        </div>

        <ExampleWithSource for={DrillWithExternalDataExample} source={DrillWithExternalDataExampleSRC} />
    </div>
);

export default DrillWithExternalData;
