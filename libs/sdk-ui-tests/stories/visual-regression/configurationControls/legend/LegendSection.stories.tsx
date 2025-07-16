// (C) 2020-2025 GoodData Corporation
/* eslint-disable sonarjs/no-identical-functions */

import { action } from "@storybook/addon-actions";
import React, { useState } from "react";
import { InternalIntlWrapper, LegendSection } from "@gooddata/sdk-ui-ext/internal";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "../controlStyles.css";

const wrapperStyle = {
    width: 400,
    height: 400,
    padding: "1em 1em",
};
const german = "de-DE";

const DefaultProperties = {};
const DefaultPropertiesMeta = {
    legend_section: { collapsed: false },
};

export default {
    title: "11 Configuration Controls/Legend/LegendSection",
};

export const LegendsectionDisabled = () => (
    <div style={wrapperStyle} className="screenshot-target">
        <InternalIntlWrapper>
            <LegendSection
                controlsDisabled={true}
                properties={DefaultProperties}
                propertiesMeta={DefaultPropertiesMeta}
                pushData={action("onLegendSectionToggle")}
            />
        </InternalIntlWrapper>
    </div>
);
LegendsectionDisabled.parameters = { kind: "LegendSection: Disabled", screenshot: true };

export const LegendsectionEnabled = () => {
    const LegendWidget = () => {
        const [properties, setProperties] = useState(DefaultProperties);
        const onPushData = (data: any) => {
            action("onLegendSectionToggle")(data);
            const { properties } = data;
            setProperties({ ...properties });
        };

        return (
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper>
                    <LegendSection
                        controlsDisabled={false}
                        properties={properties}
                        propertiesMeta={DefaultPropertiesMeta}
                        pushData={onPushData}
                    />
                </InternalIntlWrapper>
            </div>
        );
    };
    return <LegendWidget />;
};
LegendsectionEnabled.parameters = {
    kind: "LegendSection: Enabled",
    screenshots: {
        closed: {},
        opened: {
            clickSelector: ".gd-button-primary",
            postInteractionWait: 200,
        },
        "select-position": {
            clickSelectors: [".gd-button-primary", ".s-bottom"],
            postInteractionWait: 200,
        },
    },
};

export const LegendsectionEnabledLocalized = () => {
    const LegendWidget = () => {
        const [properties, setProperties] = useState(DefaultProperties);
        const onPushData = (data: any) => {
            action("onLegendSectionToggle")(data);
            const { properties } = data;
            setProperties({ ...properties });
        };

        return (
            <div style={wrapperStyle} className="screenshot-target">
                <InternalIntlWrapper locale={german}>
                    <LegendSection
                        controlsDisabled={false}
                        properties={properties}
                        propertiesMeta={DefaultPropertiesMeta}
                        pushData={onPushData}
                    />
                </InternalIntlWrapper>
            </div>
        );
    };
    return <LegendWidget />;
};
LegendsectionEnabledLocalized.parameters = {
    kind: "LegendSection: Enabled - localized",
    screenshots: {
        closed: {},
        opened: {
            clickSelector: ".gd-button-primary",
            postInteractionWait: 200,
        },
        "select-position": {
            clickSelectors: [".gd-button-primary", ".s-unten"],
            postInteractionWait: 200,
        },
    },
};
