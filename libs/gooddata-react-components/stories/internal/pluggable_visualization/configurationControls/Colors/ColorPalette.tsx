// (C) 2007-2019 GoodData Corporation

import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import "../../../../../styles/internal/css/config_panel.css";
import * as ChartConfiguration from "../../../../../src/interfaces/Config";
import ColorPalette from "../../../../../src/internal/components/configurationControls/colors/colorDropdown/ColorPalette";
import { getLargePalette } from "../../../../../src/internal/mocks/testColorHelper";
import { SmallScreenDecorator } from "../../../../utils/SmallScreenDecorator";
import { InternalIntlWrapper } from "../../../../../src/internal/utils/internalIntlProvider";

storiesOf("Internal/Pluggable visualization/Configuration controls/Colors/ColorPalette", module)
    .add("ColorPalette", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColorPalette
                    colorPalette={ChartConfiguration.DEFAULT_COLOR_PALETTE}
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
                    colorPalette={ChartConfiguration.DEFAULT_COLOR_PALETTE}
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
