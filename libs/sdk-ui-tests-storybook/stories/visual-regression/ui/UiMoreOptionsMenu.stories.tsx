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

// Enough labels to exceed the menu's max-height, so the rows scroll while the
// header and Cancel/Apply footer stay pinned (see F1-2600).
const MANY_LABELS: IUiLabelsChecklistItem[] = [
    { id: "city", label: "City", kind: "primary", locked: true },
    { id: "name", label: "City Name", kind: "default" },
    { id: "code", label: "City Code" },
    { id: "region", label: "Region" },
    { id: "country", label: "Country" },
    { id: "continent", label: "Continent" },
    { id: "timezone", label: "Time Zone" },
    { id: "icon", label: "Custom Icon" },
];

function MenuExample({
    label,
    labels,
    withTransfer = false,
}: {
    label: string;
    labels?: IUiLabelsChecklistItem[];
    withTransfer?: boolean;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--gd-palette-complementary-6)" }}>{label}</span>
            <UiMoreOptionsMenu
                labels={labels}
                selectedLabelIds={labels?.map((l) => l.id)}
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
                <MenuExample label="Labels + transfer" labels={LABELS} withTransfer />
                <MenuExample label="Labels only" labels={LABELS} />
                <MenuExample label="Many labels (scrolls)" labels={MANY_LABELS} />
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
