// (C) 2026 GoodData Corporation

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { type IUiLabelsPickerItem, UiButton, UiLabelsPicker } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const ITEMS: IUiLabelsPickerItem[] = [
    { id: "id", label: "Customer ID", kind: "primary", locked: true },
    { id: "name", label: "Customer Name", kind: "default" },
    { id: "email", label: "Customer Email" },
    { id: "ssn", label: "Customer SSN" },
];

const ALL_SELECTED = ["id", "name", "email", "ssn"];
const PARTIAL = ["id", "name"];

function PickerExample({
    label,
    defaultSelectedIds,
}: {
    label: string;
    defaultSelectedIds: ReadonlyArray<string>;
}) {
    return (
        <UiLabelsPicker
            anchor={<UiButton label={label} size="small" variant="secondary" iconAfter="chevronDown" />}
            items={ITEMS}
            defaultSelectedIds={defaultSelectedIds}
            onApply={action(`apply (${label})`)}
        />
    );
}

function UiLabelsPickerExample() {
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div
                className="screenshot-target"
                style={{ display: "flex", gap: 24, padding: 24, flexWrap: "wrap" }}
            >
                <PickerExample label="All labels" defaultSelectedIds={ALL_SELECTED} />
                <PickerExample label="2 of 4 labels" defaultSelectedIds={PARTIAL} />
                <PickerExample label="Only primary" defaultSelectedIds={[]} />
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiLabelsPicker",
};

export function Default() {
    return <UiLabelsPickerExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiLabelsPickerExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
