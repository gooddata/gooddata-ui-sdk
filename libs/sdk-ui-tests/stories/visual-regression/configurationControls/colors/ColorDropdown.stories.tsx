// (C) 2020-2025 GoodData Corporation

import { action } from "storybook/actions";

import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { ColorDropdown, ColoredItemContent, InternalIntlWrapper } from "@gooddata/sdk-ui-ext/internal";

import { type INeobackstopConfig, type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { getLargePalette } from "../mocks/testColorHelper.js";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "../controlStyles.css";

const wrapperStyle = {
    width: 400,
    height: 400,
    paddingTop: 200,
};
const german = "de-DE";

const defaultScenarios: INeobackstopConfig = {
    closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
    opened: {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelector: ".gd-icon-navigatedown",
        delay: {
            postOperation: 200,
        },
    },
    "select-custom-color": {
        readySelector: { selector: ".screenshot-target", state: State.Attached },
        clickSelectors: [
            { selector: ".s-colored-items-list-item" },
            { selector: ".s-custom-section-button" },
        ],
        delay: {
            postOperation: 200,
        },
    },
};

// eslint-disable-next-line no-restricted-exports
export default {
    title: "11 Configuration Controls/Colors/ColorDropdown",
};

export function Colordropdown() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <ColorDropdown colorPalette={DefaultColorPalette} onColorSelected={action("onColorSelect")}>
                    <ColoredItemContent
                        text="<<< this color hardcoded for tests"
                        color={{ r: 20, g: 178, b: 226 }}
                    />
                </ColorDropdown>
            </InternalIntlWrapper>
        </div>
    );
}
Colordropdown.parameters = {
    kind: "ColorDropdown",
    screenshots: defaultScenarios,
} satisfies IStoryParameters;

export function ColordropdownPreSelectedWithLargePalette() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <ColorDropdown
                    selectedColorItem={{ type: "guid", value: "11_12" }}
                    colorPalette={getLargePalette()}
                    onColorSelected={action("onColorSelect")}
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
} satisfies IStoryParameters;

export function ColordropdownLocalized() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper locale={german}>
                <ColorDropdown colorPalette={DefaultColorPalette} onColorSelected={action("onColorSelect")}>
                    <ColoredItemContent
                        text="<<< this color hardcoded for tests"
                        color={{ r: 20, g: 178, b: 226 }}
                    />
                </ColorDropdown>
            </InternalIntlWrapper>
        </div>
    );
}
ColordropdownLocalized.parameters = {
    kind: "ColorDropdown with custom picker - localized",
    screenshots: defaultScenarios,
} satisfies IStoryParameters;
