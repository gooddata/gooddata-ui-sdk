// (C) 2007-2019 GoodData Corporation

import * as React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import "../../../../../styles/internal/css/config_panel.css";
import { IntlDecorator } from "../../../../utils/IntlDecorators";
import * as ChartConfiguration from "../../../../../src/interfaces/Config";
import ColorPalette from "../../../../../src/internal/components/configurationControls/colors/colorDropdown/ColorPalette";
import { getLargePalette } from "../../../../../src/internal/mocks/testColorHelper";
import { SmallScreenDecorator } from "../../../../utils/SmallScreenDecorator";

storiesOf("Internal/Pluggable visualization/Configuration controls/Colors/ColorPalette", module)
    .add("ColorPalette", () =>
        IntlDecorator(
            SmallScreenDecorator(
                <ColorPalette
                    colorPalette={ChartConfiguration.DEFAULT_COLOR_PALETTE}
                    onColorSelected={action("onColorSelected")}
                />,
            ),
        ),
    )
    .add("ColorPalette selected item with guid 7", () =>
        IntlDecorator(
            SmallScreenDecorator(
                <ColorPalette
                    selectedColorGuid="7"
                    colorPalette={ChartConfiguration.DEFAULT_COLOR_PALETTE}
                    onColorSelected={action("onColorSelected")}
                />,
            ),
        ),
    )
    .add("ColorPalette large palette", () =>
        IntlDecorator(
            SmallScreenDecorator(
                <ColorPalette colorPalette={getLargePalette()} onColorSelected={action("onColorSelected")} />,
            ),
        ),
    )
    .add("ColorPalette large palette 11_12", () =>
        IntlDecorator(
            SmallScreenDecorator(
                <ColorPalette
                    selectedColorGuid="11_12"
                    colorPalette={getLargePalette()}
                    onColorSelected={action("onColorSelected")}
                />,
            ),
        ),
    );
