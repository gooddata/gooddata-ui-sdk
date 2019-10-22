// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { DatePickerExample } from "./DatePickerExample";
import { MonthPickerExample } from "./MonthPickerExample";

import DatePickerExampleSRC from "!raw-loader!./DatePickerExample";
import MonthPickerExampleSRC from "!raw-loader!./MonthPickerExample";

export const DatePicker: React.FC = () => (
    <div>
        <h1>Date Picker</h1>

        <p>
            This is an example of two custom date picker components filtering a visualization by absolute
            date.
        </p>

        <ExampleWithSource for={DatePickerExample} source={DatePickerExampleSRC} />

        <h1>Month Picker</h1>

        <p>
            This is an example of two custom month picker components filtering a visualization by relative
            date.
        </p>

        <ExampleWithSource for={MonthPickerExample} source={MonthPickerExampleSRC} />
    </div>
);
