// (C) 2026 GoodData Corporation

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { UiButton, UiPermissionMenu } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function MenuExample({ label, withRemove = false }: { label: string; withRemove?: boolean }) {
    return (
        <UiPermissionMenu
            anchor={<UiButton label={label} size="small" variant="secondary" iconAfter="chevronDown" />}
            selectedLevel="VIEW"
            onPermissionChange={action(`${label} → permission change`)}
            onRemoveAccess={withRemove ? action(`${label} → remove access`) : undefined}
        />
    );
}

function UiPermissionMenuExample() {
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div
                className="screenshot-target"
                style={{ display: "flex", gap: 24, padding: 24, flexWrap: "wrap" }}
            >
                <MenuExample label="Levels only" />
                <MenuExample label="With remove" withRemove />
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiPermissionMenu",
};

export function Default() {
    return <UiPermissionMenuExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiPermissionMenuExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
