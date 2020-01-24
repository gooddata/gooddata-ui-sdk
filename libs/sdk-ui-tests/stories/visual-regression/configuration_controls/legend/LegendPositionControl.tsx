import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import LegendPositionControl from "@gooddata/sdk-ui/dist/internal/components/configurationControls/legend/LegendPositionControl";
import { InternalIntlWrapper } from "@gooddata/sdk-ui/dist/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui/styles/internal/css/config_panel.css";
import { SmallScreenDecorator } from "../../../utils/SmallScreenDecorator";

storiesOf("Visual regression/Configuration controls/legend/LegendSection", module)
    .add("LegendPositionControl: Disabled", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <LegendPositionControl
                    disabled={true}
                    showDisabledMessage={true}
                    properties={() => {}}
                    value=""
                    pushData={action("onPositionSelect")}
                />
            </InternalIntlWrapper>,
        ),
    )
    .add("LegendPositionControl: Enabled", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <LegendPositionControl
                    disabled={false}
                    showDisabledMessage={false}
                    properties={() => {}}
                    value=""
                    pushData={action("onPositionSelect")}
                />
            </InternalIntlWrapper>,
        ),
    );
