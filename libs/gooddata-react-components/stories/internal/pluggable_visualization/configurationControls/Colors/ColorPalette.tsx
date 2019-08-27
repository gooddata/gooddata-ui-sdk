// (C) 2007-2019 GoodData Corporation

import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { DEFAULT_COLOR_PALETTE } from "../../../../../src/components/visualizations/utils/defaultColors";
import ColorPalette from "../../../../../src/internal/components/configurationControls/colors/colorDropdown/ColorPalette";
import { getLargePalette } from "../../../../../src/internal/mocks/testColorHelper";
import { InternalIntlWrapper } from "../../../../../src/internal/utils/internalIntlProvider";
import "../../../../../styles/internal/css/config_panel.css";
import { SmallScreenDecorator } from "../../../../utils/SmallScreenDecorator";

storiesOf("Internal/Pluggable visualization/Configuration controls/Colors/ColorPalette", module)
    .add("ColorPalette", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColorPalette
                    colorPalette={DEFAULT_COLOR_PALETTE}
                    onColorSelected={action("onColorSelected")}
                />
            </InternalIntlWrapper>,
        ),
    )
    .add("ColorPalette selected item with guid 7", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColorPalette
                    selectedColorGuid="7"
                    colorPalette={DEFAULT_COLOR_PALETTE}
                    onColorSelected={action("onColorSelected")}
                />
            </InternalIntlWrapper>,
        ),
    )
    .add("ColorPalette large palette", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColorPalette colorPalette={getLargePalette()} onColorSelected={action("onColorSelected")} />
            </InternalIntlWrapper>,
        ),
    )
    .add("ColorPalette large palette 11_12", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColorPalette
                    selectedColorGuid="11_12"
                    colorPalette={getLargePalette()}
                    onColorSelected={action("onColorSelected")}
                />
            </InternalIntlWrapper>,
        ),
    );
