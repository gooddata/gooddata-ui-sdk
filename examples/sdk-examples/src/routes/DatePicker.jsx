// (C) 2007-2019 GoodData Corporation
import React from "react";
import ExampleWithSource from "../components/utils/ExampleWithSource";

import DatePickerExample from "../components/DatePickerExample";
import MonthPickerExample from "../components/MonthPickerExample";

import DatePickerExampleSRC from "!raw-loader!../components/DatePickerExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import MonthPickerExampleSRC from "!raw-loader!../components/MonthPickerExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const DatePicker = () => (
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

export default DatePicker;
