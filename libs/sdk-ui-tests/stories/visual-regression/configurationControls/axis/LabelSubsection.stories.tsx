// (C) 2020-2025 GoodData Corporation

/* eslint-disable sonarjs/no-identical-functions */

import { useState } from "react";

import { action } from "storybook/actions";

import { InternalIntlWrapper, LabelSubsection } from "@gooddata/sdk-ui-ext/internal";
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
    title: "11 Configuration Controls/Axis/LabelSubsection",
};

export function AxisDisabled() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <LabelSubsection
                    disabled
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={defaultProps}
                    pushData={action("onSubsectionSelect")}
                />
            </InternalIntlWrapper>
        </div>
    );
}
AxisDisabled.parameters = { kind: "axis: Disabled", screenshot: true };

export function AxisEnabled() {
    function HandleState() {
        const [axisProperties, setAxisProperties] = useState({});
        const onPushData = (data: any) => {
            const { properties } = data;
            action("onSubsectionSelect")(data);
            setAxisProperties({ ...properties });
        };

        return (
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper>
                    <LabelSubsection
                        disabled={false}
                        configPanelDisabled
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
AxisEnabled.parameters = { kind: "axis: Enabled", screenshots: commonScenarios };

export function AxisEnabledLocalized() {
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
                    <LabelSubsection
                        disabled={false}
                        configPanelDisabled
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
AxisEnabledLocalized.parameters = { kind: "axis: Enabled - localized", screenshots: commonScenarios };
