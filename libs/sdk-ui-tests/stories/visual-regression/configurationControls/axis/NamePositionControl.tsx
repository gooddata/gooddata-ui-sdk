// (C) 2020 GoodData Corporation

import { action } from "@storybook/addon-actions";
import { storiesOf } from "../../../_infra/storyRepository.js";
import React from "react";
import { InternalIntlWrapper, NamePositionControl } from "@gooddata/sdk-ui-ext/internal";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import { ConfigurationControls } from "../../../_infra/storyGroups.js";
import "../controlStyles.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const german = "de-DE";

storiesOf(`${ConfigurationControls}/Axis/NamePositionControls`)
    .add(
        "x-axis",
        () => {
            return (
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
                </div>
            );
        },
        {
            screenshots: {
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
        },
    )
    .add(
        "disabled",
        () => {
            return (
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
                </div>
            );
        },
        { screenshot: true },
    )
    .add(
        "y-axis - localized",
        () => {
            return (
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
                </div>
            );
        },
        {
            screenshots: {
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
        },
    );
