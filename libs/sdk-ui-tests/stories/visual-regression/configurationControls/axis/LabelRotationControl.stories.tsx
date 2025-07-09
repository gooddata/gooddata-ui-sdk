// (C) 2020-2025 GoodData Corporation

import { action } from "@storybook/addon-actions";
import React from "react";
import { InternalIntlWrapper, LabelRotationControl } from "@gooddata/sdk-ui-ext/internal";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "../controlStyles.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const german = "de-DE";

export default {
    title: "11 Configuration Controls/Axis/LabelRotationControl",
};

export const Disabled = () => (
    <div style={wrapperStyle} className="screenshot-target">
        <InternalIntlWrapper>
            <LabelRotationControl
                disabled={true}
                configPanelDisabled={false}
                axis="xaxis"
                properties={{}}
                pushData={action("onRotationSelect")}
            />
        </InternalIntlWrapper>
    </div>
);
Disabled.parameters = { kind: "disabled", screenshot: true };

export const YAxis = () => (
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
};

export const XAxisLocalized = () => (
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
};
