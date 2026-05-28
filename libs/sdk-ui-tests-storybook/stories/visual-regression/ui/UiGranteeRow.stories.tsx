// (C) 2026 GoodData Corporation

import { IntlProvider } from "react-intl";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { UiGranteeRow } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function controls(label: string) {
    return <span style={{ color: "var(--gd-palette-complementary-6)" }}>{label}</span>;
}

function UiGranteeRowExample() {
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div className="screenshot-target" style={{ width: 560 }}>
                <UiGranteeRow kind="user" name="Marek Stránský" email="marek.stransky@gooddata.com" isOwner />
                <UiGranteeRow kind="group" name="Admin" controls={controls("Can view")} />
                <UiGranteeRow
                    kind="user"
                    name="Jana Dvořák"
                    email="jana.dvorak@gooddata.com"
                    controls={controls("Can share")}
                />
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiGranteeRow",
};

export function Default() {
    return <UiGranteeRowExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiGranteeRowExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
