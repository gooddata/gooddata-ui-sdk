// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ExampleWithSource } from "../../components/ExampleWithSource";
import { PivotTableDrillExample } from "./PivotTableDrillExample";
import PivotTableDrillExampleSRC from "!raw-loader!./PivotTableDrillExample";
import { DrillWithExternalDataExample } from "./DrillWithExternalDataExample";
import DrillWithExternalDataExampleSRC from "!raw-loader!./DrillWithExternalDataExample";

export const PivotTableDrilling: React.FC = () => (
    <div>
        <h1>Pivot Table Drilling</h1>

        <ExampleWithSource for={PivotTableDrillExample} source={PivotTableDrillExampleSRC} />
    </div>
);

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
