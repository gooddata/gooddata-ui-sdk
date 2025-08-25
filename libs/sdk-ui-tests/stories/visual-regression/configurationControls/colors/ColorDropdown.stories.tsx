// (C) 2020-2025 GoodData Corporation

import React from "react";

import { action } from "storybook/actions";

import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { ColorDropdown, ColoredItemContent, InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";

import { getLargePalette } from "../mocks/testColorHelper.js";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "../controlStyles.css";

const wrapperStyle = {
    width: 400,
    height: 400,
    paddingTop: 200,
};
const german = "de-DE";

const defaultScenarios = {
    closed: {},
    opened: {
        clickSelector: ".gd-icon-navigatedown",
        postInteractionWait: 200,
    },
};

const customPicker = {
    ...defaultScenarios,
    "select-custom-color": {
        clickSelectors: [".s-colored-items-list-item", ".s-custom-section-button"],
        postInteractionWait: 200,
    },
};

export default {
    title: "11 Configuration Controls/Colors/ColorDropdown",
};

export function Colordropdown() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <ColorDropdown
                    colorPalette={DefaultColorPalette}
                    onColorSelected={action("onColorSelect")}
                    showCustomPicker={false}
                >
                    <ColoredItemContent
                        text="<<< this color hardcoded for tests"
                        color={{ r: 20, g: 178, b: 226 }}
                    />
                </ColorDropdown>
            </InternalIntlWrapper>
        </div>
    );
}
Colordropdown.parameters = { kind: "ColorDropdown", screenshots: defaultScenarios };

export function ColordropdownPreSelectedWithLargePalette() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <ColorDropdown
                    selectedColorItem={{ type: "guid", value: "11_12" }}
                    colorPalette={getLargePalette()}
                    onColorSelected={action("onColorSelect")}
                    showCustomPicker={false}
                >
                    <ColoredItemContent
                        text="<<< this color hardcoded for tests"
                        color={{ r: 20, g: 178, b: 226 }}
                    />
                </ColorDropdown>
            </InternalIntlWrapper>
        </div>
    );
}
ColordropdownPreSelectedWithLargePalette.parameters = {
    kind: "ColorDropdown pre-selected with large palette",
    screenshots: defaultScenarios,
};

export function ColordropdownWithCustomPicker() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <ColorDropdown
                    colorPalette={DefaultColorPalette}
                    onColorSelected={action("onColorSelect")}
                    showCustomPicker={true}
                >
                    <ColoredItemContent
                        text="<<< this color hardcoded for tests"
                        color={{ r: 20, g: 178, b: 226 }}
                    />
                </ColorDropdown>
            </InternalIntlWrapper>
        </div>
    );
}
ColordropdownWithCustomPicker.parameters = {
    kind: "ColorDropdown with custom picker",
    screenshots: customPicker,
};

export function ColordropdownWithCustomPickerLocalized() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper locale={german}>
                <ColorDropdown
                    colorPalette={DefaultColorPalette}
                    onColorSelected={action("onColorSelect")}
                    showCustomPicker={true}
                >
                    <ColoredItemContent
                        text="<<< this color hardcoded for tests"
                        color={{ r: 20, g: 178, b: 226 }}
                    />
                </ColorDropdown>
            </InternalIntlWrapper>
        </div>
    );
}
ColordropdownWithCustomPickerLocalized.parameters = {
    kind: "ColorDropdown with custom picker - localized",
    screenshots: customPicker,
};
