// (C) 2021 GoodData Corporation

import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import React from "react";
import { LabelFormatControl } from "@gooddata/sdk-ui-ext/dist/internal/components/configurationControls/axis/LabelFormatControl";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import { withMultipleScreenshots, withScreenshot } from "../../../_infra/backstopWrapper";
import { ConfigurationControls } from "../../../_infra/storyGroups";
import "../controlStyles.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

storiesOf(`${ConfigurationControls}/Axis/LabelFormatControl`, module)
    .add("disabled", () => {
        return withScreenshot(
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
            </div>,
        );
    })
    .add("y-axis", () => {
        return withMultipleScreenshots(
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
            </div>,
            {
                closed: {},
                opened: { clickSelectors: [".gd-button-primary"], postInteractionWait: 200 },
                "select-option": {
                    clickSelectors: [".gd-button-primary", ".s-inherit"],
                    postInteractionWait: 200,
                },
            },
        );
    });
