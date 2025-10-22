// (C) 2020-2025 GoodData Corporation

import { useState } from "react";

import { action } from "storybook/actions";

import { InternalIntlWrapper, NameSubsection } from "@gooddata/sdk-ui-ext/internal";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "../controlStyles.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const german = "de-DE";
const defaultProps = {};

const commonScenarios = {
    closed: {},
    opened: {
        clickSelector: ".gd-button-primary",
        postInteractionWait: ".gd-list",
        delay: {
            postOperation: 500,
        },
    },
    "label-toggle": {
        clickSelectors: [".s-checkbox-toggle-label"],
        delay: {
            postOperation: 500,
        },
    },
};

export default {
    title: "11 Configuration Controls/Axis/NameSubsection",
};

export function XAxisDisabled() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <NameSubsection
                    disabled
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={defaultProps}
                    pushData={action("onSubsectionToggle")}
                />
            </InternalIntlWrapper>
        </div>
    );
}
XAxisDisabled.parameters = { kind: "x-axis: Disabled", screenshot: true };

export function XAxisEnabled() {
    function HandleState() {
        const [axisProperties, setAxisProperties] = useState({});
        const onPushData = (data: any) => {
            action("onSubsectionToggle")(data);
            const { properties } = data;
            setAxisProperties({ ...properties });
        };

        return (
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper>
                    <NameSubsection
                        disabled={false}
                        configPanelDisabled={false}
                        axis="xaxis"
                        properties={axisProperties}
                        pushData={onPushData}
                    />
                </InternalIntlWrapper>
            </div>
        );
    }
    return <HandleState />;
}
XAxisEnabled.parameters = { kind: "x-axis: Enabled", screenshots: commonScenarios };

export function YAxisEnabledLocalize() {
    function HandleState() {
        const [axisProperties, setAxisProperties] = useState({});
        const onPushData = (data: any) => {
            const { properties } = data;
            action("onSubsectionSelect")(data);
            setAxisProperties({ ...properties });
        };

        return (
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper locale={german}>
                    <NameSubsection
                        disabled={false}
                        configPanelDisabled={false}
                        axis="yaxis"
                        properties={axisProperties}
                        pushData={onPushData}
                    />
                </InternalIntlWrapper>
            </div>
        );
    }
    return <HandleState />;
}
YAxisEnabledLocalize.parameters = { kind: "y-axis: Enabled - localize", screenshots: commonScenarios };
