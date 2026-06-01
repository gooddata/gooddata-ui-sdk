// (C) 2026 GoodData Corporation

import { IntlProvider } from "react-intl";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { type IUiLabelsListItem, UiLabelsList } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const ITEMS: IUiLabelsListItem[] = [
    { id: "id", label: "Customer ID", kind: "primary" },
    { id: "name", label: "Customer Name", kind: "default" },
    { id: "email", label: "Customer Email" },
    { id: "ssn", label: "Customer SSN" },
];

const SINGLE_ITEM: IUiLabelsListItem[] = [{ id: "id", label: "Customer ID", kind: "primary" }];

export default {
    title: "15 Ui/UiLabelsList",
};

function UiLabelsListExample() {
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div className="screenshot-target" style={{ display: "flex", gap: 24 }}>
                <UiLabelsList items={ITEMS} />
                <UiLabelsList items={SINGLE_ITEM} />
                <UiLabelsList items={[]} />
            </div>
        </IntlProvider>
    );
}

export function Default() {
    return <UiLabelsListExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiLabelsListExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
