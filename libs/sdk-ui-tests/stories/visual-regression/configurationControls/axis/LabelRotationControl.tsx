// (C) 2020 GoodData Corporation

import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import React from "react";
import LabelRotationControl from "@gooddata/sdk-ui-ext/dist/cjs/internal/components/configurationControls/axis/LabelRotationControl";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/cjs/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import { withMultipleScreenshots, withScreenshot } from "../../../_infra/backstopWrapper";
import { ConfigurationControls } from "../../../_infra/storyGroups";
import "../controlStyles.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const german = "de-DE";

storiesOf(`${ConfigurationControls}/Axis/LabelRotationControl`, module)
    .add("disabled", () => {
        return withScreenshot(
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
            </div>,
        );
    })
    .add("y-axis", () => {
        return withMultipleScreenshots(
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
            </div>,
            {
                closed: {},
                opened: { clickSelectors: [".gd-button-primary"], postInteractionWait: 200 },
                "select-option": {
                    clickSelectors: [".gd-button-primary", ".s-30_"],
                    postInteractionWait: 200,
                },
            },
        );
    })
    .add("x-axis - localized", () => {
        return withMultipleScreenshots(
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
            </div>,
            {
                closed: {},
                opened: { clickSelectors: [".gd-button-primary"], postInteractionWait: 200 },
                "select-option": {
                    clickSelectors: [".gd-button-primary", ".s-30_"],
                    postInteractionWait: 200,
                },
            },
        );
    });
