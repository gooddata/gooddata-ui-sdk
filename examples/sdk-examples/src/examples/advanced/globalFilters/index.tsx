// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";
import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { GlobalFiltersExample } from "./GlobalFiltersExample";
import GlobalFiltersExampleSRC from "!raw-loader!./GlobalFiltersExample";
import GlobalFiltersExampleSRCJS from "!raw-loader!../../../../examplesJS/advanced/globalFilters/GlobalFiltersExample";

export const GlobalFilters: React.FC = () => (
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
            <h1>Global Filters</h1>
            <p>
                Here is how you can combine several components to apply a dynamic attribute filter to multiple
                display and GoodData.UI components.
            </p>
            <p>
                The AttributeElements component loads values of the Employee Name attribute. When you click an
                attribute value (employee) in the left pane, the KPIs, pie chart and bar chart are filtered by
                the selected attribute value (employee). In addition, employee information is passed into the
                EmployeeCard component that renders static data mixed with external data.
            </p>
        </div>

        <ExampleWithSource
            for={GlobalFiltersExample}
            source={GlobalFiltersExampleSRC}
            sourceJS={GlobalFiltersExampleSRCJS}
        />
    </div>
);
