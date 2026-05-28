// (C) 2026 GoodData Corporation

import { IntlProvider } from "react-intl";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { UiGranteeAvatar } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function UiGranteeAvatarExample() {
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div className="screenshot-target" style={{ display: "flex", gap: 16, padding: 16 }}>
                <UiGranteeAvatar kind="user" />
                <UiGranteeAvatar kind="group" />
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiGranteeAvatar",
};

export function Default() {
    return <UiGranteeAvatarExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiGranteeAvatarExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
