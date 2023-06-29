// (C) 2020 GoodData Corporation

import { action } from "@storybook/addon-actions";
import { storiesOf } from "../../../_infra/storyRepository.js";
import React from "react";
import { InternalIntlWrapper, LabelRotationControl } from "@gooddata/sdk-ui-ext/internal";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import { ConfigurationControls } from "../../../_infra/storyGroups.js";
import "../controlStyles.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const german = "de-DE";

storiesOf(`${ConfigurationControls}/Axis/LabelRotationControl`)
    .add(
        "disabled",
        () => {
            return (
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
        },
        { screenshot: true },
    )
    .add(
        "y-axis",
        () => {
            return (
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
        },
        {
            screenshots: {
                closed: {},
                opened: { clickSelectors: [".gd-button-primary"], postInteractionWait: 200 },
                "select-option": {
                    clickSelectors: [".gd-button-primary", ".s-30_"],
                    postInteractionWait: 200,
                },
            },
        },
    )
    .add(
        "x-axis - localized",
        () => {
            return (
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
        },
        {
            screenshots: {
                closed: {},
                opened: { clickSelectors: [".gd-button-primary"], postInteractionWait: 200 },
                "select-option": {
                    clickSelectors: [".gd-button-primary", ".s-30_"],
                    postInteractionWait: 200,
                },
            },
        },
    );
