// (C) 2020 GoodData Corporation

import { action } from "@storybook/addon-actions";
import { storiesOf } from "../../../_infra/storyRepository.js";
import React, { useState } from "react";
import { InternalIntlWrapper, NameSubsection } from "@gooddata/sdk-ui-ext/internal";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import { ConfigurationControls } from "../../../_infra/storyGroups.js";
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
storiesOf(`${ConfigurationControls}/Axis/NameSubsection`)
    .add(
        "x-axis: Disabled",
        () => {
            return (
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
                </div>
            );
        },
        { screenshot: true },
    )
    .add(
        "x-axis: Enabled",
        () => {
            const HandleState = () => {
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
            };

            return <HandleState />;
        },
        { screenshots: commonScenarios },
    )
    .add(
        "y-axis: Enabled - localize",
        () => {
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
            };
            return <HandleState />;
        },
        { screenshots: commonScenarios },
    );
