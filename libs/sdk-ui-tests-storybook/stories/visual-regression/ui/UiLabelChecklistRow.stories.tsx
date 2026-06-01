// (C) 2026 GoodData Corporation

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { UiLabelChecklistRow } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

export default {
    title: "15 Ui/UiLabelChecklistRow",
};

function UiLabelChecklistRowExample() {
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div className="screenshot-target" style={{ width: 280 }}>
                <UiLabelChecklistRow
                    label="Customer ID"
                    kind="primary"
                    suffix="(Primary)"
                    checked
                    disabled
                    onChange={action("primary toggle")}
                />
                <UiLabelChecklistRow
                    label="Customer Name"
                    kind="default"
                    suffix="(Default)"
                    checked
                    onChange={action("default toggle")}
                />
                <UiLabelChecklistRow label="Customer Email" checked onChange={action("email toggle")} />
                <UiLabelChecklistRow label="Customer SSN" checked={false} onChange={action("ssn toggle")} />
                <UiLabelChecklistRow
                    label="A really long display-form name that should ellipsize gracefully"
                    checked
                    onChange={action("long toggle")}
                />
            </div>
        </IntlProvider>
    );
}

export function Default() {
    return <UiLabelChecklistRowExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiLabelChecklistRowExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
