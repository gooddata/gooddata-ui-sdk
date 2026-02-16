// (C) 2020-2026 GoodData Corporation

/* oxlint-disable sonarjs/no-identical-functions */

import { useState } from "react";

import { action } from "storybook/actions";

import { InternalIntlWrapper, LegendSection } from "@gooddata/sdk-ui-ext/internal";

import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "../controlStyles.css";
import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";

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

export function LegendsectionDisabled() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <LegendSection
                    controlsDisabled
                    properties={DefaultProperties}
                    propertiesMeta={DefaultPropertiesMeta}
                    pushData={action("onLegendSectionToggle")}
                />
            </InternalIntlWrapper>
        </div>
    );
}
LegendsectionDisabled.parameters = {
    kind: "LegendSection: Disabled",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function LegendsectionEnabled() {
    function LegendWidget() {
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
    }
    return <LegendWidget />;
}
LegendsectionEnabled.parameters = {
    kind: "LegendSection: Enabled",
    screenshots: {
        closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-button-primary",
            delay: {
                postOperation: 200,
            },
        },
        "select-position": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".gd-button-primary" }, { selector: ".s-bottom" }],
            delay: {
                postOperation: 200,
            },
        },
    },
} satisfies IStoryParameters;

export function LegendsectionEnabledLocalized() {
    function LegendWidget() {
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
    }
    return <LegendWidget />;
}
LegendsectionEnabledLocalized.parameters = {
    kind: "LegendSection: Enabled - localized",
    screenshots: {
        closed: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
        opened: {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelector: ".gd-button-primary",
            delay: {
                postOperation: 200,
            },
        },
        "select-position": {
            readySelector: { selector: ".screenshot-target", state: State.Attached },
            clickSelectors: [{ selector: ".gd-button-primary" }, { selector: ".s-unten" }],
            delay: {
                postOperation: 200,
            },
        },
    },
} satisfies IStoryParameters;
