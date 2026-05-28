// (C) 2026 GoodData Corporation

import { useState } from "react";

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { type GeneralAccessValue, UiGeneralAccessRadio } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function UiGeneralAccessRadioExample() {
    const [value, setValue] = useState<GeneralAccessValue>("RESTRICTED");
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div className="screenshot-target" style={{ width: 560 }}>
                <UiGeneralAccessRadio
                    value={value}
                    onChange={(next) => {
                        action("value change")(next);
                        setValue(next);
                    }}
                    workspaceControls={
                        <span style={{ color: "var(--gd-palette-complementary-6)" }}>Can view</span>
                    }
                />
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiGeneralAccessRadio",
};

export function Default() {
    return <UiGeneralAccessRadioExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiGeneralAccessRadioExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
