// (C) 2020-2025 GoodData Corporation
/* eslint-disable sonarjs/no-identical-functions */

import { action } from "storybook/actions";
import { useState } from "react";
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
    },
    "label-toggle": {
        clickSelectors: [".s-checkbox-toggle-label", ".s-checkbox-toggle"],
        postInteractionWait: 200,
    },
};

export default {
    title: "11 Configuration Controls/Axis/LabelSubsection",
};

export const AxisDisabled = () => (
    <div style={wrapperStyle} className="screenshot-target">
        <InternalIntlWrapper>
            <LabelSubsection
                disabled={true}
                configPanelDisabled={false}
                axis="xaxis"
                properties={defaultProps}
                pushData={action("onSubsectionSelect")}
            />
        </InternalIntlWrapper>
    </div>
);
AxisDisabled.parameters = { kind: "axis: Disabled", screenshot: true };

export const AxisEnabled = () => {
    const HandleState = () => {
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
                        configPanelDisabled={true}
                        axis="xaxis"
                        properties={axisProperties}
                        pushData={onPushData}
                    />
                </InternalIntlWrapper>
            </div>
        );
    };
    return <HandleState />;
};
AxisEnabled.parameters = { kind: "axis: Enabled", screenshots: commonScenarios };

export const AxisEnabledLocalized = () => {
    const HandleState = () => {
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
                        configPanelDisabled={true}
                        axis="yaxis"
                        properties={axisProperties}
                        pushData={onPushData}
                    />
                </InternalIntlWrapper>
            </div>
        );
    };
    return <HandleState />;
};
AxisEnabledLocalized.parameters = { kind: "axis: Enabled - localized", screenshots: commonScenarios };
