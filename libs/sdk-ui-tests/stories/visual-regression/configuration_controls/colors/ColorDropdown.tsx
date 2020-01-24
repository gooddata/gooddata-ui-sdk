// (C) 2020 GoodData Corporation

import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { DefaultColorPalette } from "@gooddata/sdk-ui/dist/base";
import ColorDropdown from "@gooddata/sdk-ui/dist/internal/components/configurationControls/colors/colorDropdown/ColorDropdown";
import ColoredItemContent from "@gooddata/sdk-ui/dist/internal/components/configurationControls/colors/coloredItemsList/ColoredItemContent";
import { getLargePalette } from "../mocks/testColorHelper";
import { InternalIntlWrapper } from "@gooddata/sdk-ui/dist/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui/styles/internal/css/config_panel.css";
import { SmallScreenDecorator } from "../../../utils/SmallScreenDecorator";
import { SmallScrollDecorator } from "../../../utils/SmallScrollDecorator";

storiesOf("Visual regression/Configuration controls/Colors/ColorDropdown", module)
    .add("ColorDropdown", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColorDropdown
                    colorPalette={DefaultColorPalette}
                    onColorSelected={action("onColorSelect")}
                    showCustomPicker={false}
                >
                    <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                </ColorDropdown>
            </InternalIntlWrapper>,
        ),
    )
    .add("ColorDropdown selected guid:4 color", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColorDropdown
                    selectedColorItem={{ type: "guid", value: "4" }}
                    colorPalette={DefaultColorPalette}
                    onColorSelected={action("onColorSelect")}
                    showCustomPicker={false}
                >
                    <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                </ColorDropdown>
            </InternalIntlWrapper>,
        ),
    )
    .add("ColorDropdown selected guid 11_12 with large palette", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColorDropdown
                    selectedColorItem={{ type: "guid", value: "11_12" }}
                    colorPalette={getLargePalette()}
                    onColorSelected={action("onColorSelect")}
                    showCustomPicker={false}
                >
                    <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                </ColorDropdown>
            </InternalIntlWrapper>,
        ),
    )
    .add("ColorDropdown with custom picker", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColorDropdown
                    colorPalette={DefaultColorPalette}
                    onColorSelected={action("onColorSelect")}
                    showCustomPicker={true}
                >
                    <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                </ColorDropdown>
            </InternalIntlWrapper>,
        ),
    )
    .add("ColorDropdown with custom picker selected guid 4 color", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColorDropdown
                    selectedColorItem={{ type: "guid", value: "4" }}
                    colorPalette={DefaultColorPalette}
                    onColorSelected={action("onColorSelect")}
                    showCustomPicker={true}
                >
                    <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                </ColorDropdown>
            </InternalIntlWrapper>,
        ),
    )
    .add("ColorDropdown with custom picker selected rgb color rgb(20, 178, 226)", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColorDropdown
                    selectedColorItem={{ type: "rgb", value: { r: 20, g: 178, b: 226 } }}
                    colorPalette={DefaultColorPalette}
                    onColorSelected={action("onColorSelect")}
                    showCustomPicker={true}
                >
                    <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                </ColorDropdown>
            </InternalIntlWrapper>,
        ),
    )
    .add("Parent scroll ColorDropdown", () =>
        SmallScrollDecorator(
            400,
            400,
            <InternalIntlWrapper>
                <ColorDropdown
                    colorPalette={getLargePalette()}
                    onColorSelected={action("onColorSelect")}
                    showCustomPicker={false}
                >
                    <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                </ColorDropdown>
                <br />
                <br />
                <ColorDropdown
                    colorPalette={DefaultColorPalette}
                    onColorSelected={action("onColorSelect")}
                    showCustomPicker={true}
                >
                    <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                </ColorDropdown>
                <br />
                <br />
                <ColorDropdown
                    colorPalette={DefaultColorPalette}
                    onColorSelected={action("onColorSelect")}
                    showCustomPicker={true}
                >
                    <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                </ColorDropdown>
            </InternalIntlWrapper>,
        ),
    );
