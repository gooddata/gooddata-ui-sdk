import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import NamePositionControl from "@gooddata/sdk-ui/dist/internal/components/configurationControls/axis/NamePositionControl";
import { InternalIntlWrapper } from "@gooddata/sdk-ui/dist/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui/styles/internal/css/config_panel.css";
import { SmallScreenDecorator } from "../../../utils/SmallScreenDecorator";
import { AXIS } from "@gooddata/sdk-ui/dist/internal/constants/axis";

storiesOf("Visual regression/Configuration controls/Axis/NamePositionControls", module)
    .add("NamePositionControl: x-axis", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <NamePositionControl
                    disabled={false}
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={AXIS}
                    pushData={action("onPositionSelect")}
                />
            </InternalIntlWrapper>,
        ),
    )
    .add("NamePositionControl: y-axis", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <NamePositionControl
                    disabled={false}
                    configPanelDisabled={false}
                    axis="yaxis"
                    properties={AXIS}
                    pushData={action("onPositionSelect")}
                />
            </InternalIntlWrapper>,
        ),
    )
    .add("NamePositionControl disabled", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <NamePositionControl
                    disabled={true}
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={AXIS}
                    pushData={action("onPositionSelect")}
                />
            </InternalIntlWrapper>,
        ),
    );
