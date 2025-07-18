// (C) 2020-2025 GoodData Corporation

import { action } from "storybook/actions";
import React from "react";
import { InternalIntlWrapper, NamePositionControl } from "@gooddata/sdk-ui-ext/internal";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "../controlStyles.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const german = "de-DE";

export default {
    title: "11 Configuration Controls/Axis/NamePositionControls",
};

export const XAxis = () => (
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
XAxis.parameters = {
    kind: "x-axis",
    screenshots: {
        closed: {},
        opened: {
            clickSelector: ".gd-button-primary",
            postInteractionWait: 200,
        },
        "select-option": {
            clickSelectors: [".gd-button-primary", ".s-left"],
            postInteractionWait: 200,
        },
    },
};

export const Disabled = () => (
    <div style={wrapperStyle} className="screenshot-target">
        <InternalIntlWrapper>
            <NamePositionControl
                disabled={true}
                configPanelDisabled={false}
                axis="xaxis"
                properties={{}}
                pushData={action("onPositionSelect")}
            />
        </InternalIntlWrapper>
    </div>
);
Disabled.parameters = { kind: "disabled", screenshot: true };

export const YAxisLocalized = () => (
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
YAxisLocalized.parameters = {
    kind: "y-axis - localized",
    screenshots: {
        closed: {},
        opened: {
            clickSelector: ".gd-button-primary",
            postInteractionWait: 200,
        },
        "select-option": {
            clickSelectors: [".gd-button-primary", ".s-mitte"],
            postInteractionWait: 200,
        },
    },
};
