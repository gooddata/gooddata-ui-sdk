// (C) 2020 GoodData Corporation

import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { DefaultColorPalette } from "@gooddata/sdk-ui/dist/base/constants/colorPalette";
import ColorPalette from "@gooddata/sdk-ui/dist/internal/components/configurationControls/colors/colorDropdown/ColorPalette";
import { getLargePalette } from "../mocks/testColorHelper";
import { InternalIntlWrapper } from "@gooddata/sdk-ui/dist/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui/styles/internal/css/config_panel.css";
import { SmallScreenDecorator } from "../../../utils/SmallScreenDecorator";

storiesOf("Visual regression/Configuration controls/Colors/ColorPalette", module)
    .add("ColorPalette", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <ColorPalette
                    colorPalette={DefaultColorPalette}
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
                    colorPalette={DefaultColorPalette}
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
