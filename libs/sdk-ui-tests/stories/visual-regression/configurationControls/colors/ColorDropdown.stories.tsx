// (C) 2020-2025 GoodData Corporation

import { action } from "storybook/actions";
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { getLargePalette } from "../mocks/testColorHelper.js";
import { InternalIntlWrapper, ColorDropdown, ColoredItemContent } from "@gooddata/sdk-ui-ext/internal";
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

export const Colordropdown = () => (
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
Colordropdown.parameters = { kind: "ColorDropdown", screenshots: defaultScenarios };

export const ColordropdownPreSelectedWithLargePalette = () => (
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
ColordropdownPreSelectedWithLargePalette.parameters = {
    kind: "ColorDropdown pre-selected with large palette",
    screenshots: defaultScenarios,
};

export const ColordropdownWithCustomPicker = () => (
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
ColordropdownWithCustomPicker.parameters = {
    kind: "ColorDropdown with custom picker",
    screenshots: customPicker,
};

export const ColordropdownWithCustomPickerLocalized = () => (
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
ColordropdownWithCustomPickerLocalized.parameters = {
    kind: "ColorDropdown with custom picker - localized",
    screenshots: customPicker,
};
