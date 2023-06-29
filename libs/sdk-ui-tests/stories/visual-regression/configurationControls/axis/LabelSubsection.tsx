// (C) 2020 GoodData Corporation
/* eslint-disable sonarjs/no-identical-functions */

import { action } from "@storybook/addon-actions";
import { storiesOf } from "../../../_infra/storyRepository.js";
import React, { useState } from "react";
import { InternalIntlWrapper, LabelSubsection } from "@gooddata/sdk-ui-ext/internal";
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

storiesOf(`${ConfigurationControls}/Axis/LabelSubsection`)
    .add(
        "axis: Disabled",
        () => {
            return (
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
        },
        { screenshot: true },
    )
    .add(
        "axis: Enabled",
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
        },
        { screenshots: commonScenarios },
    )
    .add(
        "axis: Enabled - localized",
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
        },
        { screenshots: commonScenarios },
    );
