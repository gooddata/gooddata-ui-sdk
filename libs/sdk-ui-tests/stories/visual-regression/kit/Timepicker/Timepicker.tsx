// (C) 2019-2020 GoodData Corporation
import React, { useState } from "react";
import { TimePicker } from "@gooddata/sdk-ui-kit";
import { storiesOf } from "@storybook/react";
import { UiKit } from "../../../_infra/storyGroups";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

const TimePickerExamples: React.FC = () => {
    const [time, setTime] = useState<Date>(new Date(2015, 2, 15, 0, 0, 0, 0));

    return (
        <div className="library-component screenshot-target gd-timepicker">
            <h4>Basic picker</h4>
            <TimePicker time={new Date()} />

            <h4>Set time externally</h4>
            <div>
                <TimePicker time={time} />
                <br />
                <br />
                <button onClick={() => setTime(new Date())}>Externally set current time</button>
            </div>
        </div>
    );
};

storiesOf(`${UiKit}/TimePicker`, module).add("full-featured", () => <TimePickerExamples />);
