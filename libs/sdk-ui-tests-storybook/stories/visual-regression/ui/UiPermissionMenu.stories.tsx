// (C) 2026 GoodData Corporation

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { UiButton, UiPermissionMenu } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function MenuExample({
    label,
    withTransfer = false,
    withLabels = false,
    withRemove = false,
}: {
    label: string;
    withTransfer?: boolean;
    withLabels?: boolean;
    withRemove?: boolean;
}) {
    return (
        <UiPermissionMenu
            anchor={<UiButton label={label} size="small" variant="secondary" iconAfter="chevronDown" />}
            onPermissionChange={action(`${label} → permission change`)}
            onTransferOwnership={withTransfer ? action(`${label} → transfer ownership`) : undefined}
            onLabelsClick={withLabels ? action(`${label} → labels`) : undefined}
            labelsCounter={withLabels ? "4/4" : undefined}
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
                <MenuExample label="Full" withTransfer withLabels withRemove />
                <MenuExample label="Remove only" withRemove />
                <MenuExample label="Labels only" withLabels />
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
