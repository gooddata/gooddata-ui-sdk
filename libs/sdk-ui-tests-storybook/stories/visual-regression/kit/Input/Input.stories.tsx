// (C) 2020-2026 GoodData Corporation

import { memo, useState } from "react";

import { Input } from "@gooddata/sdk-ui-kit";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";
import { type IStoryParameters } from "../../../_infra/backstopScenario.js";

const AutofocsExamples = memo(function AutofocsExamples() {
    const [autofocus1, setAutofocus1] = useState(false);

    return (
        <div className="library-component">
            <h4>Input without autofocus</h4>

            <Input
                onChange={(val) => console.log(val)} // eslint-disable-line no-console
                placeholder="Search attributes..."
                autofocus={autofocus1}
            />
            <button onClick={() => setAutofocus1(!autofocus1)}>
                {autofocus1 ? "Turn off autofocus" : "Turn on autofocus"}
            </button>

            <h4>Input with autofocus</h4>
            <Input
                onChange={(val) => console.log(val)} // eslint-disable-line no-console
                placeholder="Search attributes..."
                autofocus
            />

            <h4>Hidden input with autofocus</h4>
            <p>
                This show <code>console.warn</code> messsage after some time because autofocus is not
                possible!
            </p>
            <div style={{ display: "none" }}>
                <Input
                    onChange={(val) => console.log(val)} // eslint-disable-line no-console
                    placeholder="Search attributes..."
                    autofocus
                />
            </div>
        </div>
    );
});

export default {
    title: "12 UI Kit/Input",
};

export function Autofocus() {
    return <AutofocsExamples />;
}
Autofocus.parameters = { kind: "autofocus" } satisfies IStoryParameters;
