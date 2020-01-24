import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import LabelSubsection from "@gooddata/sdk-ui/dist/internal/components/configurationControls/axis/LabelSubsection";
import { InternalIntlWrapper } from "@gooddata/sdk-ui/dist/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui/styles/internal/css/config_panel.css";
import { SmallScreenDecorator } from "../../../utils/SmallScreenDecorator";
import { AXIS } from "@gooddata/sdk-ui/dist/internal/constants/axis";

storiesOf("Visual regression/Configuration controls/Axis/LabelSubsection", module)
    .add("LabelSubsection for x-axis: Disabled", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <LabelSubsection
                    disabled={true}
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={AXIS}
                    pushData={action("onSubsectionSelect")}
                />
            </InternalIntlWrapper>,
        ),
    )
    .add("LabelSubsection for y-axis: Enabled", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <LabelSubsection
                    disabled={false}
                    configPanelDisabled={false}
                    axis="yaxis"
                    properties={AXIS}
                    pushData={action("onSubsectionSelect")}
                />
            </InternalIntlWrapper>,
        ),
    )
    .add("LabelSubsection for x-axis: Enabled", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <LabelSubsection
                    disabled={false}
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={AXIS}
                    pushData={action("onSubsectionSelect")}
                />
            </InternalIntlWrapper>,
        ),
    );
