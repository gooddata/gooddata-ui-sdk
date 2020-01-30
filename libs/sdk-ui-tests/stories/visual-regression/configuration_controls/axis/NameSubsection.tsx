// (C) 2020 GoodData Corporation

import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { useState } from "react";
import NameSubsection from "@gooddata/sdk-ui/dist/internal/components/configurationControls/axis/NameSubsection";
import { InternalIntlWrapper } from "@gooddata/sdk-ui/dist/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui/styles/internal/css/config_panel.css";
import { withMultipleScreenshots, withScreenshot } from "../../_infra/backstopWrapper";
import { ConfigurationControls } from "../../_infra/storyGroups";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const mobileViewport = [{ label: "mobile-view", height: 800, width: 480 }];
const german = "de-DE";
const defaultProps = {};

const commonScenarios = {
    closed: {},
    opened: {
        clickSelector: ".s-checkbox-toggle-label",
        postInteractionWait: 200,
    },
    "label-toggle": {
        clickSelectors: [".s-checkbox-toggle-label", ".s-checkbox-toggle"],
        postInteractionWait: 200,
    },
    "opened-mobile": {
        clickSelector: ".s-checkbox-toggle-label",
        postInteractionWait: 200,
        viewports: mobileViewport,
    },
    "label-toggle-mobile": {
        clickSelectors: [".s-checkbox-toggle-label", ".s-checkbox-toggle"],
        postInteractionWait: 200,
        viewports: mobileViewport,
    },
};
storiesOf(`${ConfigurationControls}/Axis/NameSubsection`, module)
    .add("x-axis: Disabled", () => {
        return withScreenshot(
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper>
                    <NameSubsection
                        disabled={true}
                        configPanelDisabled={false}
                        axis="xaxis"
                        properties={defaultProps}
                        pushData={action("onSubsectionToggle")}
                    />
                </InternalIntlWrapper>
            </div>,
        );
    })
    .add("x-axis: Enabled", () => {
        const HandleState = () => {
            const [axisProperties, setAxisProperties] = useState({});
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <InternalIntlWrapper>
                        <NameSubsection
                            disabled={false}
                            configPanelDisabled={false}
                            axis="xaxis"
                            properties={axisProperties}
                            pushData={data => {
                                action("onSubsectionToggle")(data);
                                const { properties } = data;
                                setAxisProperties({ ...properties });
                            }}
                        />
                    </InternalIntlWrapper>
                </div>
            );
        };

        return withMultipleScreenshots(<HandleState />, commonScenarios);
    })
    .add("y-axis: Enabled - localize", () => {
        const HandleState = () => {
            const [axisProperties, setAxisProperties] = useState({});
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <InternalIntlWrapper locale={german}>
                        <NameSubsection
                            disabled={false}
                            configPanelDisabled={false}
                            axis="yaxis"
                            properties={axisProperties}
                            pushData={data => {
                                const { properties } = data;
                                action("onSubsectionSelect")(data);
                                setAxisProperties({ ...properties });
                            }}
                        />
                    </InternalIntlWrapper>
                </div>
            );
        };
        return withMultipleScreenshots(<HandleState />, commonScenarios);
    });
