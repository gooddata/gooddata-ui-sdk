// (C) 2021-2025 GoodData Corporation

import { action } from "storybook/actions";

import { InternalIntlWrapper, LabelFormatControl } from "@gooddata/sdk-ui-ext/internal";

import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "../controlStyles.css";
import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

// eslint-disable-next-line no-restricted-exports
export default {
    title: "11 Configuration Controls/Axis/LabelFormatControl",
};

export function Disabled() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <LabelFormatControl
                    disabled
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={{}}
                    pushData={action("onFormatSelect")}
                />
            </InternalIntlWrapper>
        </div>
    );
}
Disabled.parameters = {
    kind: "disabled",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function YAxis() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <LabelFormatControl
                    disabled={false}
                    configPanelDisabled={false}
                    axis="yaxis"
                    properties={{}}
                    pushData={action("onFormatSelect")}
                />
            </InternalIntlWrapper>
        </div>
    );
}
YAxis.parameters = {
    kind: "y-axis",
    screenshots: {
        closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".gd-button-primary" }],
            delay: {
                postOperation: 200,
            },
        },
        "select-option": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".gd-button-primary" }, { selector: ".s-inherit" }],
            delay: {
                postOperation: 200,
            },
        },
    },
} satisfies IStoryParameters;
