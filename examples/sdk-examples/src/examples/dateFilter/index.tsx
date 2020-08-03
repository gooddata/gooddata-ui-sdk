// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import { DateFilterComponentExample } from "./DateFilterComponentExample";
import DateFilterComponentExampleSRC from "!raw-loader!./DateFilterComponentExample";
import DateFilterComponentExampleSRCJS from "!raw-loader!../../../examplesJS/dateFilter/DateFilterComponentExample";

import { DateFilterWithColumnChartExample } from "./DateFilterWithColumnChartExample";
import DateFilterWithColumnChartExampleSRC from "!raw-loader!./DateFilterWithColumnChartExample";
import DateFilterWithColumnChartExampleSRCJS from "!raw-loader!../../../examplesJS/dateFilter/DateFilterWithColumnChartExample";

export const DateFilter: React.FC = () => (
    <div>
        <h1>Date Filter Component</h1>

        <p>These examples show how to use the Date Filter component.</p>

        <hr className="separator" />

        <h2>Date Filter</h2>
        <p>This example shows a full-featured date filter component.</p>
        <ExampleWithSource
            for={DateFilterComponentExample}
            source={DateFilterComponentExampleSRC}
            sourceJS={DateFilterComponentExampleSRCJS}
        />

        <h2>Filtering a report</h2>
        <p>
            This example shows how to add date filter component into a report. Presets and floating range form
            is restricted to years.
        </p>
        <ExampleWithSource
            for={DateFilterWithColumnChartExample}
            source={DateFilterWithColumnChartExampleSRC}
            sourceJS={DateFilterWithColumnChartExampleSRCJS}
        />
    </div>
);
