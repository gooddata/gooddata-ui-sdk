// (C) 2026 GoodData Corporation

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { type IUiLabelsChecklistItem, UiMoreOptionsMenu } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const LABELS: IUiLabelsChecklistItem[] = [
    { id: "id", label: "Customer ID", kind: "primary", locked: true },
    { id: "name", label: "Customer Name", kind: "default" },
    { id: "email", label: "Customer Email" },
    { id: "ssn", label: "Customer SSN" },
];

function MenuExample({
    label,
    withLabels = false,
    withTransfer = false,
}: {
    label: string;
    withLabels?: boolean;
    withTransfer?: boolean;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--gd-palette-complementary-6)" }}>{label}</span>
            <UiMoreOptionsMenu
                labels={withLabels ? LABELS : undefined}
                selectedLabelIds={withLabels ? ["id", "name", "email", "ssn"] : undefined}
                onLabelsChange={action(`${label} → labels change`)}
                onTransferOwnership={withTransfer ? action(`${label} → transfer`) : undefined}
            />
        </div>
    );
}

function UiMoreOptionsMenuExample() {
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div
                className="screenshot-target"
                style={{ display: "flex", gap: 24, padding: 24, flexWrap: "wrap" }}
            >
                <MenuExample label="Labels + transfer" withLabels withTransfer />
                <MenuExample label="Labels only" withLabels />
                <MenuExample label="Transfer only" withTransfer />
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiMoreOptionsMenu",
};

export function Default() {
    return <UiMoreOptionsMenuExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiMoreOptionsMenuExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
