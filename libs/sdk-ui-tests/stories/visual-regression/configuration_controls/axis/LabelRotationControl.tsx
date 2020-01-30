// (C) 2020 GoodData Corporation

import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import LabelRotationControl from "@gooddata/sdk-ui/dist/internal/components/configurationControls/axis/LabelRotationControl";
import { InternalIntlWrapper } from "@gooddata/sdk-ui/dist/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui/styles/internal/css/config_panel.css";
import { withMultipleScreenshots, withScreenshot } from "../../_infra/backstopWrapper";
import { AXIS } from "@gooddata/sdk-ui/dist/internal/constants/axis";
import { ConfigurationControls } from "../../_infra/storyGroups";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const mobileViewport = [{ label: "mobile-view", height: 800, width: 480 }];
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
                        properties={AXIS}
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
                        properties={AXIS}
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
                "opened-mobile": {
                    clickSelector: ".gd-button-primary",
                    postInteractionWait: 200,
                    viewports: mobileViewport,
                },
                "select-option-mobile": {
                    clickSelectors: [".gd-button-primary", ".s-30_"],
                    postInteractionWait: 200,
                    viewports: mobileViewport,
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
                        properties={AXIS}
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
                "opened-mobile": {
                    clickSelector: ".gd-button-primary",
                    postInteractionWait: 200,
                    viewports: mobileViewport,
                },
                "select-option-mobile": {
                    clickSelectors: [".gd-button-primary", ".s-30_"],
                    postInteractionWait: 200,
                    viewports: mobileViewport,
                },
            },
        );
    });
