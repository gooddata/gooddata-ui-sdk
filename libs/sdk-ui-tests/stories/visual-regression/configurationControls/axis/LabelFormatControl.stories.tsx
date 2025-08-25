// (C) 2021-2025 GoodData Corporation

import React from "react";

import { action } from "storybook/actions";

import { InternalIntlWrapper, LabelFormatControl } from "@gooddata/sdk-ui-ext/internal";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "../controlStyles.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

export default {
    title: "11 Configuration Controls/Axis/LabelFormatControl",
};

export function Disabled() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <LabelFormatControl
                    disabled={true}
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={{}}
                    pushData={action("onFormatSelect")}
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
        closed: {},
        opened: { clickSelectors: [".gd-button-primary"], postInteractionWait: 200 },
        "select-option": {
            clickSelectors: [".gd-button-primary", ".s-inherit"],
            postInteractionWait: 200,
        },
    },
};
