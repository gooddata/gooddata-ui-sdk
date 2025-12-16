// (C) 2020-2025 GoodData Corporation

import { action } from "storybook/actions";

import { InternalIntlWrapper, NamePositionControl } from "@gooddata/sdk-ui-ext/internal";

import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "../controlStyles.css";
import { type INeobackstopConfig, State } from "../../../_infra/backstopScenario.js";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const german = "de-DE";

// eslint-disable-next-line no-restricted-exports
export default {
    title: "11 Configuration Controls/Axis/NamePositionControls",
};

export function XAxis() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <NamePositionControl
                    disabled={false}
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={{}}
                    pushData={action("onPositionSelect")}
                />
            </InternalIntlWrapper>
        </div>
    );
}
XAxis.parameters = {
    kind: "x-axis",
    screenshots: {
        closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-button-primary",
            delay: {
                postOperation: 200,
            },
        },
        "select-option": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".gd-button-primary" }, { selector: ".s-left" }],
            delay: {
                postOperation: 200,
            },
        },
    } satisfies INeobackstopConfig,
};

export function Disabled() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <NamePositionControl
                    disabled
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={{}}
                    pushData={action("onPositionSelect")}
                />
            </InternalIntlWrapper>
        </div>
    );
}
Disabled.parameters = {
    kind: "disabled",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
};

export function YAxisLocalized() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper locale={german}>
                <NamePositionControl
                    disabled={false}
                    configPanelDisabled={false}
                    axis="yaxis"
                    properties={{}}
                    pushData={action("onPositionSelect")}
                />
            </InternalIntlWrapper>
        </div>
    );
}
YAxisLocalized.parameters = {
    kind: "y-axis - localized",
    screenshots: {
        closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-button-primary",
            delay: {
                postOperation: 200,
            },
        },
        "select-option": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".gd-button-primary" }, { selector: ".s-mitte" }],
            delay: {
                postOperation: 200,
            },
        },
    } satisfies INeobackstopConfig,
};
