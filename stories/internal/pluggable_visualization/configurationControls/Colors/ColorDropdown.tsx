// (C) 2007-2019 GoodData Corporation

import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import "../../../../../styles/internal/css/config_panel.css";
import * as ChartConfiguration from "../../../../../src/interfaces/Config";
import ColorDropdown from "../../../../../src/internal/components/configurationControls/colors/colorDropdown/ColorDropdown";
// tslint:disable-next-line:max-line-length
import ColoredItemContent from "../../../../../src/internal/components/configurationControls/colors/coloredItemsList/ColoredItemContent";
import { getLargePalette } from "../../../../../src/internal/mocks/testColorHelper";
import { SmallScrollDecorator } from "../../../../utils/SmallScrollDecorator";
import { SmallScreenDecorator } from "../../../../utils/SmallScreenDecorator";
import { InternalIntlWrapper } from "../../../../../src/internal/utils/internalIntlProvider";

storiesOf("Internal/Pluggable visualization/Configuration controls/Colors/ColorDropdown", module)
    .add("ColorDropdown", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColorDropdown
                    colorPalette={ChartConfiguration.DEFAULT_COLOR_PALETTE}
                    onColorSelected={action("Color selected")}
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
                    colorPalette={ChartConfiguration.DEFAULT_COLOR_PALETTE}
                    onColorSelected={action("Color selected")}
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
                    onColorSelected={action("Color selected")}
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
                    colorPalette={ChartConfiguration.DEFAULT_COLOR_PALETTE}
                    onColorSelected={action("Color selected")}
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
                    colorPalette={ChartConfiguration.DEFAULT_COLOR_PALETTE}
                    onColorSelected={action("Color selected")}
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
                    colorPalette={ChartConfiguration.DEFAULT_COLOR_PALETTE}
                    onColorSelected={action("Color selected")}
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
            100,
            <InternalIntlWrapper>
                <ColorDropdown
                    colorPalette={getLargePalette()}
                    onColorSelected={action("Color selected")}
                    showCustomPicker={false}
                >
                    <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                </ColorDropdown>
                <br />
                <br />
                <ColorDropdown
                    colorPalette={ChartConfiguration.DEFAULT_COLOR_PALETTE}
                    onColorSelected={action("Color selected")}
                    showCustomPicker={true}
                >
                    <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                </ColorDropdown>
                <br />
                <br />
                <ColorDropdown
                    colorPalette={ChartConfiguration.DEFAULT_COLOR_PALETTE}
                    onColorSelected={action("Color selected")}
                    showCustomPicker={true}
                >
                    <ColoredItemContent text="aaa" color={{ r: 20, g: 178, b: 226 }} />
                </ColorDropdown>
            </InternalIntlWrapper>,
        ),
    );
