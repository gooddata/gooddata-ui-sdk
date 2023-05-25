// (C) 2019-2020 GoodData Corporation
import React, { useState } from "react";
import { Timepicker } from "@gooddata/sdk-ui-kit";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

const TimePickerExamples: React.FC = () => {
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
};

storiesOf(`${UiKit}/TimePicker`)
    .add("full-featured", () => <TimePickerExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<TimePickerExamples />), { screenshot: true });
