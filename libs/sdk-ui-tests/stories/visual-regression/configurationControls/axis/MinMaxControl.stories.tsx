// (C) 2020-2025 GoodData Corporation

import { action } from "storybook/actions";

import { InternalIntlWrapper, MinMaxControl } from "@gooddata/sdk-ui-ext/internal";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "../controlStyles.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const mobileViewport = [{ label: "mobile-view", height: 800, width: 480 }];
const german = "de-DE";

export default {
    title: "11 Configuration Controls/Axis/MinMaxControls",
};

export function Disabled() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <MinMaxControl
                    isDisabled={true}
                    basePath={""}
                    pushData={action("")}
                    properties={{}}
                    propertiesMeta={{}}
                />
            </InternalIntlWrapper>
        </div>
    );
}
Disabled.parameters = { kind: "disabled", screenshot: true };

export function Enabled() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <MinMaxControl
                    isDisabled={false}
                    basePath={""}
                    pushData={action("")}
                    properties={{}}
                    propertiesMeta={{}}
                />
            </InternalIntlWrapper>
        </div>
    );
}
Enabled.parameters = {
    kind: "enabled",
    screenshots: {
        closed: {},
        opened: {
            clickSelectors: [".s-configuration-subsection-properties-axis-scale", ".gd-input-field"],
            postInteractionWait: 200,
        },
        "opened-mobile": {
            clickSelectors: [".s-configuration-subsection-properties-axis-scale", ".gd-input-field"],
            postInteractionWait: 200,
            viewports: mobileViewport,
        },
    },
};

export function EnabledLocale() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper locale={german}>
                <MinMaxControl
                    isDisabled={false}
                    basePath={""}
                    pushData={action("")}
                    properties={{}}
                    propertiesMeta={{}}
                />
            </InternalIntlWrapper>
        </div>
    );
}
EnabledLocale.parameters = {
    kind: "enabled - locale",
    screenshots: {
        closed: {},
        opened: {
            clickSelectors: [".s-configuration-subsection-properties-axis-scale", ".gd-input-field"],
            postInteractionWait: 200,
        },
        "opened-mobile": {
            clickSelectors: [".s-configuration-subsection-properties-axis-scale", ".gd-input-field"],
            postInteractionWait: 200,
            viewports: mobileViewport,
        },
    },
};
