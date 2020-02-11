// (C) 2020 GoodData Corporation

import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { DefaultColorPalette } from "@gooddata/sdk-ui/dist/base";
import ColorDropdown from "@gooddata/sdk-ui-ext/dist/internal/components/configurationControls/colors/colorDropdown/ColorDropdown";
import ColoredItemContent from "@gooddata/sdk-ui-ext/dist/internal/components/configurationControls/colors/coloredItemsList/ColoredItemContent";
import { getLargePalette } from "../mocks/testColorHelper";
import { withMultipleScreenshots } from "../../_infra/backstopWrapper";
import { ConfigurationControls } from "../../_infra/storyGroups";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const mobileViewport = [{ label: "mobile-view", height: 800, width: 480 }];
const german = "de-DE";

const scenario1 = {
    closed: {},
    opened: {
        clickSelector: ".s-colored-items-list-item",
        postInteractionWait: 200,
    },
    "dropdown-opened": {
        clickSelectors: [".s-colored-items-list-item", ".s-color-drop-down-list"],
        postInteractionWait: 200,
    },
    "select-color": {
        clickSelectors: [".s-colored-items-list-item", ".s-color-drop-down-list", ".s-color-list-item-7"],
        postInteractionWait: 200,
    },
    "dropdown-opened-mobile": {
        clickSelectors: [".s-colored-items-list-item", ".s-color-drop-down-list"],
        postInteractionWait: 200,
        viewports: mobileViewport,
    },
    "select-color-mobile": {
        clickSelectors: [".s-colored-items-list-item", ".s-color-drop-down-list", ".s-color-list-item-7"],
        postInteractionWait: 200,
        viewports: mobileViewport,
    },
};

const scenario2 = {
    closed: {},
    opened: {
        clickSelector: ".s-colored-items-list-item",
        postInteractionWait: 200,
    },
    "dropdown-opened": {
        clickSelectors: [".s-colored-items-list-item", ".s-color-drop-down-list"],
        postInteractionWait: 200,
    },
    "select-color": {
        clickSelectors: [".s-colored-items-list-item", ".s-color-drop-down-list", ".s-color-list-item-12_13"],
        postInteractionWait: 200,
    },
    "dropdown-opened-mobile": {
        clickSelectors: [".s-colored-items-list-item", ".s-color-drop-down-list"],
        postInteractionWait: 200,
        viewports: mobileViewport,
    },
    "select-color-mobile": {
        clickSelectors: [".s-colored-items-list-item", ".s-color-drop-down-list", ".s-color-list-item-12_13"],
        postInteractionWait: 200,
        viewports: mobileViewport,
    },
};

const scenario3 = {
    scenario2,
    "select-custom-color": {
        clickSelectors: [".s-colored-items-list-item", ".s-custom_color"],
        postInteractionWait: 200,
    },
    "select-custom-color-mobile": {
        clickSelectors: [".s-colored-items-list-item", ".s-custom_color"],
        postInteractionWait: 200,
        viewports: mobileViewport,
    },
};

storiesOf(`${ConfigurationControls}/Colors/ColorDropdown`, module)
    .add("ColorDropdown", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper>
                    <ColorDropdown
                        colorPalette={DefaultColorPalette}
                        onColorSelected={action("onColorSelect")}
                        showCustomPicker={false}
                    >
                        <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                    </ColorDropdown>
                </InternalIntlWrapper>
            </div>,
            scenario1,
        );
    })
    .add("ColorDropdown selected guid:4 color", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper>
                    <ColorDropdown
                        selectedColorItem={{ type: "guid", value: "4" }}
                        colorPalette={DefaultColorPalette}
                        onColorSelected={action("onColorSelect")}
                        showCustomPicker={false}
                    >
                        <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                    </ColorDropdown>
                </InternalIntlWrapper>
            </div>,
            scenario1,
        );
    })
    .add("ColorDropdown selected guid 11_12 with large palette", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper>
                    <ColorDropdown
                        selectedColorItem={{ type: "guid", value: "11_12" }}
                        colorPalette={getLargePalette()}
                        onColorSelected={action("onColorSelect")}
                        showCustomPicker={false}
                    >
                        <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                    </ColorDropdown>
                </InternalIntlWrapper>
            </div>,
            scenario2,
        );
    })
    .add("ColorDropdown with custom picker", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper>
                    <ColorDropdown
                        colorPalette={DefaultColorPalette}
                        onColorSelected={action("onColorSelect")}
                        showCustomPicker={true}
                    >
                        <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                    </ColorDropdown>
                </InternalIntlWrapper>
            </div>,
            scenario3,
        );
    })
    .add("ColorDropdown with custom picker - localized", () => {
        return withMultipleScreenshots(
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper locale={german}>
                    <ColorDropdown
                        colorPalette={DefaultColorPalette}
                        onColorSelected={action("onColorSelect")}
                        showCustomPicker={true}
                    >
                        <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                    </ColorDropdown>
                </InternalIntlWrapper>
            </div>,
            {
                scenario2,
                "select-custom-color": {
                    clickSelectors: [".s-colored-items-list-item", ".s-custom-section-button"],
                    postInteractionWait: 200,
                },
                "select-custom-color-mobile": {
                    clickSelectors: [".s-colored-items-list-item", ".s-custom-section-button"],
                    postInteractionWait: 200,
                    viewports: mobileViewport,
                },
            },
        );
    });
