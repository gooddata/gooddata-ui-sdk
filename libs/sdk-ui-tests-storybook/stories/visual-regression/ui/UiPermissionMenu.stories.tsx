// (C) 2026 GoodData Corporation

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { type IUiLabelsChecklistItem, UiButton, UiPermissionMenu } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const LABELS: IUiLabelsChecklistItem[] = [
    { id: "id", label: "Customer ID", kind: "primary", locked: true },
    { id: "name", label: "Customer Name", kind: "default" },
    { id: "email", label: "Customer Email" },
];

function MenuExample({
    label,
    withRemove = false,
    withLabels = false,
    withDisabledShare = false,
}: {
    label: string;
    withRemove?: boolean;
    withLabels?: boolean;
    withDisabledShare?: boolean;
}) {
    return (
        <UiPermissionMenu
            anchor={<UiButton label={label} size="small" variant="secondary" iconAfter="chevronDown" />}
            selectedLevel="VIEW"
            onPermissionChange={action(`${label} → permission change`)}
            disabledLevels={withDisabledShare ? ["SHARE", "EDIT"] : undefined}
            disabledTooltip={withDisabledShare ? "You can't set higher permissions for yourself." : undefined}
            labels={withLabels ? LABELS : undefined}
            selectedLabelIds={withLabels ? LABELS.map((l) => l.id) : undefined}
            onLabelsChange={withLabels ? action(`${label} → labels change`) : undefined}
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
                <MenuExample label="Disabled level" withRemove withDisabledShare />
                <MenuExample label="Merged (labels + remove)" withRemove withLabels />
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
