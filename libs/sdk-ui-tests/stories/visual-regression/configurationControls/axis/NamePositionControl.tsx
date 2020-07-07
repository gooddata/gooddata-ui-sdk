// (C) 2020 GoodData Corporation

import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import NamePositionControl from "@gooddata/sdk-ui-ext/dist/internal/components/configurationControls/axis/NamePositionControl";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import { ConfigurationControls } from "../../../_infra/storyGroups";
import { withMultipleScreenshots, withScreenshot } from "../../../_infra/backstopWrapper";
import "../controlStyles.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const german = "de-DE";

storiesOf(`${ConfigurationControls}/Axis/NamePositionControls`, module)
    .add("x-axis", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper>
                    <NamePositionControl
                        disabled={false}
                        configPanelDisabled={false}
                        axis="xaxis"
                        properties={{}}
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
                "select-option": {
                    clickSelectors: [".gd-button-primary", ".s-left"],
                    postInteractionWait: 200,
                },
            },
        );
    })
    .add("disabled", () => {
        return withScreenshot(
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper>
                    <NamePositionControl
                        disabled={true}
                        configPanelDisabled={false}
                        axis="xaxis"
                        properties={{}}
                        pushData={action("onPositionSelect")}
                    />
                </InternalIntlWrapper>
            </div>,
        );
    })
    .add("y-axis - localized", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper locale={german}>
                    <NamePositionControl
                        disabled={false}
                        configPanelDisabled={false}
                        axis="yaxis"
                        properties={{}}
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
                "select-option": {
                    clickSelectors: [".gd-button-primary", ".s-mitte_oben_unten"],
                    postInteractionWait: 200,
                },
            },
        );
    });
