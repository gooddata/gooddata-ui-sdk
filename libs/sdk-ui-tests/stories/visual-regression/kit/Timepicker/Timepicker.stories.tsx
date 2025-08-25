// (C) 2019-2025 GoodData Corporation
import React, { useState } from "react";

import { Timepicker } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

function TimePickerExamples() {
    const [time, setTime] = useState<Date>(new Date(2015, 2, 15, 0, 0, 0, 0));

    return (
        <div className="library-component screenshot-target gd-timepicker">
            <h4>Basic picker</h4>
            <Timepicker time={new Date()} />

            <h4>Set time externally</h4>
            <div>
                <Timepicker time={time} />
                <br />
                <br />
                <button onClick={() => setTime(new Date())}>Externally set current time</button>
            </div>
        </div>
    );
}

export default {
    title: "12 UI Kit/TimePicker",
};

export function FullFeatured() {
    return <TimePickerExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<TimePickerExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
