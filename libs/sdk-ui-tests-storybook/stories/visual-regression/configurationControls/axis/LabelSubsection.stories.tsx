// (C) 2020-2026 GoodData Corporation

/* oxlint-disable sonarjs/no-identical-functions */

import { useState } from "react";

import { action } from "storybook/actions";

import { InternalIntlWrapper, LabelSubsection } from "@gooddata/sdk-ui-ext/internal";

import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "../controlStyles.css";
import { type INeobackstopConfig, type IStoryParameters, State } from "../../../_infra/backstopScenario.js";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const german = "de-DE";
const defaultProps = {};

const commonScenarios: INeobackstopConfig = {
    closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    opened: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelector: ".gd-button-primary",
        delay: {
            postOperation: 200, // element has .2s transition
        },
    },
    "label-toggle": {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelectors: [{ selector: ".s-checkbox-toggle-label" }],
        delay: {
            postOperation: 400, // checkbox has .4s transition
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
AxisDisabled.parameters = {
    kind: "axis: Disabled",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

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
AxisEnabled.parameters = { kind: "axis: Enabled", screenshots: commonScenarios } satisfies IStoryParameters;

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
AxisEnabledLocalized.parameters = {
    kind: "axis: Enabled - localized",
    screenshots: commonScenarios,
} satisfies IStoryParameters;
