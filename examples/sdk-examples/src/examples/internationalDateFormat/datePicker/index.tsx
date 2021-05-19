// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";
import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { DatePickerExample_DDMMYYYY } from "./DatePickerExample_DDMMYYYY";
import DatePickerExample_DDMMYYYYSRC from "./DatePickerExample_DDMMYYYY?raw";
import DatePickerExample_DDMMYYYYSRCJS from "./DatePickerExample_DDMMYYYY?rawJS";

import { DatePickerExample_MDYY } from "./DatePickerExample_MDYY";
import DatePickerExample_MDYYSRC from "./DatePickerExample_MDYY?raw";
import DatePickerExample_MDYYSRCJS from "./DatePickerExample_MDYY?rawJS";

export const InternationalDatePickerExample: React.FC = () => (
    <div>
        <h1>Date Picker</h1>

        <p>
            These examples show how to pass dateFormat property to a Datepicker component for dates to be
            displayed in the desired format. For more details about date formats, please see{" "}
            <a href="https://date-fns.org/docs/format" target="_blank" rel="noopener noreferrer">
                here
            </a>
            .
        </p>

        <h2>Datepicker with dates displayed in dd/MM/yyyy format</h2>
        <ExampleWithSource
            for={DatePickerExample_DDMMYYYY}
            source={DatePickerExample_DDMMYYYYSRC}
            sourceJS={DatePickerExample_DDMMYYYYSRCJS}
        />

        <h2>Datepicker with dates displayed in M/d/yy format</h2>
        <ExampleWithSource
            for={DatePickerExample_MDYY}
            source={DatePickerExample_MDYYSRC}
            sourceJS={DatePickerExample_MDYYSRCJS}
        />
    </div>
);
