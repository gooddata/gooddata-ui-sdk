import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { set } from "lodash";
import LegendSection from "@gooddata/sdk-ui/dist/internal/components/configurationControls/legend/LegendSection";
import { InternalIntlWrapper } from "@gooddata/sdk-ui/dist/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui/styles/internal/css/config_panel.css";
import { SmallScreenDecorator } from "../../../utils/SmallScreenDecorator";

const notCollapsed = set({}, "legend_section.collapsed", false);
const legendToggledOn = set({}, "controls.legend.enabled", true);

storiesOf("Visual regression/Configuration controls/legend/LegendSection", module)
    .add("LegendSection: Disabled", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <LegendSection
                    controlsDisabled={true}
                    properties={legendToggledOn}
                    propertiesMeta={notCollapsed}
                    pushData={action("onLegendSectionToggle")}
                />
            </InternalIntlWrapper>,
        ),
    )
    .add("LegendSection: Enabled", () =>
        SmallScreenDecorator(
            <InternalIntlWrapper>
                <LegendSection
                    controlsDisabled={false}
                    properties={legendToggledOn}
                    propertiesMeta={notCollapsed}
                    pushData={action("onLegendSectionToggle")}
                />
            </InternalIntlWrapper>,
        ),
    );
