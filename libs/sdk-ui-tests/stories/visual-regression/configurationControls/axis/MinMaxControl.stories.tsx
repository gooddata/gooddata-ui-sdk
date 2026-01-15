// (C) 2020-2026 GoodData Corporation

import { action } from "storybook/actions";

import { InternalIntlWrapper, MinMaxControl } from "@gooddata/sdk-ui-ext/internal";

import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "../controlStyles.css";
import { type IStoryParameters, type IViewport, State } from "../../../_infra/backstopScenario.js";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };
const mobileViewport: IViewport[] = [{ label: "mobile-view", height: 800, width: 480 }];
const german = "de-DE";

const baseScreenshot = {
    readySelector: { selector: ".screenshot-target", state: State.Attached },
    misMatchThreshold: 0.01,
};

const screenshotWithClicks = {
    ...baseScreenshot,
    clickSelectors: [
        { selector: ".s-configuration-subsection-properties-axis-scale" },
        { selector: ".gd-input-field" },
    ],
    delay: {
        postOperation: 200, // 100 was flaky
    },
};

const screenshotsConfig = {
    closed: baseScreenshot,
    opened: screenshotWithClicks,
    "opened-mobile": {
        ...screenshotWithClicks,
        viewports: mobileViewport,
    },
};

// eslint-disable-next-line no-restricted-exports
export default {
    title: "11 Configuration Controls/Axis/MinMaxControls",
};

export function Disabled() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <MinMaxControl
                    isDisabled
                    basePath={""}
                    pushData={action("")}
                    properties={{}}
                    propertiesMeta={{}}
                />
            </InternalIntlWrapper>
        </div>
    );
}
Disabled.parameters = {
    kind: "disabled",
    screenshot: baseScreenshot,
} satisfies IStoryParameters;

export function Enabled() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper>
                <MinMaxControl
                    isDisabled={false}
                    basePath={""}
                    pushData={action("")}
                    properties={{}}
                    propertiesMeta={{}}
                />
            </InternalIntlWrapper>
        </div>
    );
}
Enabled.parameters = {
    kind: "enabled",
    screenshots: screenshotsConfig,
} satisfies IStoryParameters;

export function EnabledLocale() {
    return (
        <div style={wrapperStyle} className="screenshot-target">
            <InternalIntlWrapper locale={german}>
                <MinMaxControl
                    isDisabled={false}
                    basePath={""}
                    pushData={action("")}
                    properties={{}}
                    propertiesMeta={{}}
                />
            </InternalIntlWrapper>
        </div>
    );
}
EnabledLocale.parameters = {
    kind: "enabled - locale",
    screenshots: screenshotsConfig,
} satisfies IStoryParameters;
