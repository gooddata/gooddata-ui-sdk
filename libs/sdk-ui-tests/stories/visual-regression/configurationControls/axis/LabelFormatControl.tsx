// (C) 2021 GoodData Corporation

import { action } from "@storybook/addon-actions";
import { storiesOf } from "../../../_infra/storyRepository.js";
import React from "react";
import { InternalIntlWrapper, LabelFormatControl } from "@gooddata/sdk-ui-ext/internal";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import { ConfigurationControls } from "../../../_infra/storyGroups.js";
import "../controlStyles.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

storiesOf(`${ConfigurationControls}/Axis/LabelFormatControl`)
    .add(
        "disabled",
        () => {
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
        },
        { screenshot: true },
    )
    .add(
        "y-axis",
        () => {
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
        },
        {
            screenshots: {
                closed: {},
                opened: { clickSelectors: [".gd-button-primary"], postInteractionWait: 200 },
                "select-option": {
                    clickSelectors: [".gd-button-primary", ".s-inherit"],
                    postInteractionWait: 200,
                },
            },
        },
    );
