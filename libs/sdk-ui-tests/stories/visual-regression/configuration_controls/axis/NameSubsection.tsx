import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import NameSubsection from "@gooddata/sdk-ui/dist/internal/components/configurationControls/axis/NameSubsection";
import { InternalIntlWrapper } from "@gooddata/sdk-ui/dist/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui/styles/internal/css/config_panel.css";
import { SmallScreenDecorator } from "../../../utils/SmallScreenDecorator";
import { AXIS } from "@gooddata/sdk-ui/dist/internal/constants/axis";

storiesOf("Visual regression/Configuration controls/axis/NameSubsection", module)
    .add("NameSubsection for x-axis: Disabled", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <NameSubsection
                    disabled={true}
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={AXIS}
                    pushData={action("onSubsectionToggle")}
                />
            </InternalIntlWrapper>,
        ),
    )
    .add("NameSubsection for x-axis: Enabled", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <NameSubsection
                    disabled={false}
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={AXIS}
                    pushData={action("onSubsectionToggle")}
                />
            </InternalIntlWrapper>,
        ),
    )
    .add("NameSubsection for y-axis: Enabled", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <NameSubsection
                    disabled={false}
                    configPanelDisabled={false}
                    axis="yaxis"
                    properties={AXIS}
                    pushData={action("onSubsectionToggle")}
                />
            </InternalIntlWrapper>,
        ),
    );
