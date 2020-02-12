// (C) 2020 GoodData Corporation

import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { useState } from "react";
import LegendSection from "@gooddata/sdk-ui-ext/dist/internal/components/configurationControls/legend/LegendSection";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/dist/internal/utils/internalIntlProvider";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import { ConfigurationControls } from "../../_infra/storyGroups";
import { withMultipleScreenshots, withScreenshot } from "../../_infra/backstopWrapper";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const mobileViewport = [{ label: "mobile-view", height: 800, width: 480 }];
const german = "de-DE";

const scenario = {
    closed: {},
    opened: {
        clickSelectors: [".s-checkbox-toggle"],
        postInteractionWait: 200,
    },
    "legend-toggle-mobile": {
        clickSelectors: [".s-checkbox-toggle"],
        postInteractionWait: 200,
        viewports: mobileViewport,
    },
};

storiesOf(`${ConfigurationControls}/Legend/LegendSection`, module)
    .add("LegendSection: Disabled", () => {
        return withScreenshot(
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper>
                    <LegendSection
                        controlsDisabled={true}
                        properties={{}}
                        propertiesMeta={{}}
                        pushData={action("onLegendSectionToggle")}
                    />
                </InternalIntlWrapper>
            </div>,
        );
    })
    .add("LegendSection: Enabled", () => {
        const HandleState = () => {
            const [axisProperties, setAxisProperties] = useState({});
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <InternalIntlWrapper>
                        <LegendSection
                            controlsDisabled={false}
                            properties={axisProperties}
                            propertiesMeta={axisProperties}
                            pushData={data => {
                                action("onLegendSectionToggle")(data);
                                const { properties } = data;
                                setAxisProperties({ ...properties });
                            }}
                        />
                    </InternalIntlWrapper>
                </div>
            );
        };
        return withMultipleScreenshots(<HandleState />, scenario);
    })
    .add("LegendSection: Enabled - localized", () => {
        const HandleState = () => {
            const [axisProperties, setAxisProperties] = useState({});
            return (
                <div style={wrapperStyle} className="screenshot-target">
                    <InternalIntlWrapper locale={german}>
                        <LegendSection
                            controlsDisabled={false}
                            properties={axisProperties}
                            propertiesMeta={axisProperties}
                            pushData={data => {
                                action("onLegendSectionToggle")(data);
                                const { properties } = data;
                                setAxisProperties({ ...properties });
                            }}
                        />
                    </InternalIntlWrapper>
                </div>
            );
        };

        return withMultipleScreenshots(<HandleState />, scenario);
    });
