// (C) 2020-2025 GoodData Corporation

import { action } from "storybook/actions";

import { InternalIntlWrapper, LabelRotationControl } from "@gooddata/sdk-ui-ext/internal";

import { IStoryParameters } from "../../../_infra/backstopScenario.js";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "../controlStyles.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const german = "de-DE";

// eslint-disable-next-line no-restricted-exports
export default {
    title: "11 Configuration Controls/Axis/LabelRotationControl",
};

export function Disabled() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <LabelRotationControl
                    disabled
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={{}}
                    pushData={action("onRotationSelect")}
                />
            </InternalIntlWrapper>
        </div>
    );
}
Disabled.parameters = { kind: "disabled", screenshot: true };

export function YAxis() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <LabelRotationControl
                    disabled={false}
                    configPanelDisabled={false}
                    axis="yaxis"
                    properties={{}}
                    pushData={action("onRotationSelect")}
                />
            </InternalIntlWrapper>
        </div>
    );
}
YAxis.parameters = {
    kind: "y-axis",
    screenshots: {
        closed: {},
        opened: { clickSelectors: [".gd-button-primary"], postInteractionWait: 200 },
        "select-option": {
            clickSelectors: [".gd-button-primary", ".s-30_"],
            postInteractionWait: 200,
        },
    },
} satisfies IStoryParameters;

export function XAxisLocalized() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper locale={german}>
                <LabelRotationControl
                    disabled={false}
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={{}}
                    pushData={action("onRotationSelect")}
                />
            </InternalIntlWrapper>
        </div>
    );
}
XAxisLocalized.parameters = {
    kind: "x-axis - localized",
    screenshots: {
        closed: {},
        opened: { clickSelectors: [".gd-button-primary"], postInteractionWait: 200 },
        "select-option": {
            clickSelectors: [".gd-button-primary", ".s-30_"],
            postInteractionWait: 200,
        },
    },
} satisfies IStoryParameters;
