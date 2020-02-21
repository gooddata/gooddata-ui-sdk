// (C) 2020 GoodData Corporation

import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import LegendPositionControl from "@gooddata/sdk-ui-ext/dist/internal/components/configurationControls/legend/LegendPositionControl";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import { ConfigurationControls } from "../../_infra/storyGroups";
import { withMultipleScreenshots, withScreenshot } from "../../_infra/backstopWrapper";
import "../controlStyles.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const mobileViewport = [{ label: "mobile-view", height: 800, width: 480 }];
const german = "de-DE";

storiesOf(`${ConfigurationControls}/Legend/LegendPositionControl`, module)
    .add("Disabled", () => {
        return withScreenshot(
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper>
                    <LegendPositionControl
                        disabled={true}
                        showDisabledMessage={true}
                        properties={{}}
                        value=""
                        pushData={action("onPositionSelect")}
                    />
                </InternalIntlWrapper>
            </div>,
        );
    })
    .add("Enabled", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper>
                    <LegendPositionControl
                        disabled={false}
                        showDisabledMessage={false}
                        properties={{}}
                        value=""
                        pushData={action("onPositionSelect")}
                    />
                </InternalIntlWrapper>
            </div>,
            {
                closed: {},
                opened: {
                    clickSelector: ".gd-button-primary",
                    postInteractionWait: 200,
                },
                "select-position": {
                    clickSelectors: [".gd-button-primary", ".s-down"],
                    postInteractionWait: 200,
                },
                "select-position-mobile": {
                    clickSelectors: [".gd-button-primary", ".s-down"],
                    postInteractionWait: 200,
                    viewports: mobileViewport,
                },
            },
        );
    })
    .add("Enabled - localized", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper locale={german}>
                    <LegendPositionControl
                        disabled={false}
                        showDisabledMessage={false}
                        properties={{}}
                        value=""
                        pushData={action("onPositionSelect")}
                    />
                </InternalIntlWrapper>
            </div>,
            {
                closed: {},
                opened: {
                    clickSelector: ".gd-button-primary",
                    postInteractionWait: 200,
                },
                "select-position": {
                    clickSelectors: [".gd-button-primary", ".s-runter"],
                    postInteractionWait: 200,
                },
                "select-position-mobile": {
                    clickSelectors: [".gd-button-primary", ".s-runter"],
                    postInteractionWait: 200,
                    viewports: mobileViewport,
                },
            },
        );
    });
