// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";
import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { DatePickerExample } from "./DatePickerExample";
import { MonthPickerExample } from "./MonthPickerExample";

import DatePickerExampleSRC from "./DatePickerExample?raw";
import DatePickerExampleSRCJS from "./DatePickerExample?rawJS";
import MonthPickerExampleSRC from "./MonthPickerExample?raw";
import MonthPickerExampleSRCJS from "./MonthPickerExample?rawJS";

export const DatePicker: React.FC = () => (
    <div>
        <h1>Date Picker</h1>

        <p>
            This is an example of two custom date picker components filtering a insightView by absolute date.
        </p>

        <ExampleWithSource
            for={DatePickerExample}
            source={DatePickerExampleSRC}
            sourceJS={DatePickerExampleSRCJS}
        />

        <h1>Month Picker</h1>

        <p>
            This is an example of two custom month picker components filtering a insightView by relative date.
        </p>

        <ExampleWithSource
            for={MonthPickerExample}
            source={MonthPickerExampleSRC}
            sourceJS={MonthPickerExampleSRCJS}
        />
    </div>
);
