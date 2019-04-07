// (C) 2007-2019 GoodData Corporation
import React from "react";
import ExampleWithSource from "../components/utils/ExampleWithSource";

import DatePickerExample from "../components/DatePickerExample";
import DatePickerExampleSRC from "!raw-loader!../components/DatePickerExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const DatePicker = () => (
    <div>
        <h1>Date Picker</h1>

        <p>This is an example of two custom date picker components filtering a visalization.</p>

        <ExampleWithSource for={DatePickerExample} source={DatePickerExampleSRC} />
    </div>
);

export default DatePicker;
