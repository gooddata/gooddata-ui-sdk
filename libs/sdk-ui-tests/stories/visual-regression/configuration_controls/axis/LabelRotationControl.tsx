import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import LabelRotationControl from "@gooddata/sdk-ui/dist/internal/components/configurationControls/axis/LabelRotationControl";
import { InternalIntlWrapper } from "@gooddata/sdk-ui/dist/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui/styles/internal/css/config_panel.css";
import { SmallScreenDecorator } from "../../../utils/SmallScreenDecorator";
import { withMultipleScreenshots } from "../../_infra/backstopWrapper";
import { AXIS } from "@gooddata/sdk-ui/dist/internal/constants/axis";
import { ConfigurationControls } from "../../_infra/storyGroups";

storiesOf(`${ConfigurationControls}/Axis/LabelRotationControl`, module)
    .add("LabelRotationControl disabled", () =>
        withMultipleScreenshots(
            <InternalIntlWrapper>
                <LabelRotationControl
                    disabled={true}
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={AXIS}
                    pushData={action("onRotationSelect")}
                />
            </InternalIntlWrapper>,
            {
                closed: {},
                opened: { clickSelector },
            },
        ),
    )
    .add("LabelRotationControl y-axis", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <LabelRotationControl
                    disabled={false}
                    configPanelDisabled={false}
                    axis="yaxis"
                    properties={AXIS}
                    pushData={action("onRotationSelect")}
                />
            </InternalIntlWrapper>,
        ),
    )
    .add("LabelRotationControl x-axis", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <LabelRotationControl
                    disabled={false}
                    configPanelDisabled={false}
                    axis="xaxis"
                    properties={AXIS}
                    pushData={action("onRotationSelect")}
                />
            </InternalIntlWrapper>,
        ),
    );
