// (C) 2026 GoodData Corporation

import { IntlProvider } from "react-intl";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { UiLabelRow } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

export default {
    title: "15 Ui/UiLabelRow",
};

function UiLabelRowExample() {
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div
                className="screenshot-target"
                style={{ width: 280, display: "flex", flexDirection: "column", gap: 8 }}
            >
                <UiLabelRow label="Customer Name" kind="primary" suffix="(Primary)" />
                <UiLabelRow label="Customer Name" kind="default" suffix="(Default)" />
                <UiLabelRow label="Customer Name" />
                <div style={{ paddingTop: 16 }}>
                    <UiLabelRow label="A really long display-form name that should ellipsize gracefully" />
                </div>
            </div>
        </IntlProvider>
    );
}

export function Default() {
    return <UiLabelRowExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiLabelRowExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiLabelRowExample />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
