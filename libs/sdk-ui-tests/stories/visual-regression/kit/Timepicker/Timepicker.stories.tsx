// (C) 2019-2025 GoodData Corporation

import { useState } from "react";

import { Timepicker } from "@gooddata/sdk-ui-kit";

import { type INeobackstopScenarioConfig, type IStoryParameters } from "../../../_infra/backstopScenario.js";
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

// eslint-disable-next-line no-restricted-exports
export default {
    title: "12 UI Kit/TimePicker",
};

const screenshotConfig: INeobackstopScenarioConfig = { misMatchThreshold: 0.05 }; // screenshots ~current time, which changes every run

export function FullFeatured() {
    return <TimePickerExamples />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: screenshotConfig } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<TimePickerExamples />);
Themed.parameters = { kind: "themed", screenshot: screenshotConfig } satisfies IStoryParameters;
