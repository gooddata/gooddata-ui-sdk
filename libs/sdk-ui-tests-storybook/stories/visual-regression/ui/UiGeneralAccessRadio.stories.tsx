// (C) 2026 GoodData Corporation

import { useState } from "react";

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import {
    type GeneralAccessValue,
    type IUiLabelsChecklistItem,
    UiGeneralAccessRadio,
    UiGranteeRowControls,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const LABELS: IUiLabelsChecklistItem[] = [
    { id: "id", label: "Customer ID", kind: "primary", locked: true },
    { id: "name", label: "Customer Name", kind: "default" },
    { id: "email", label: "Customer Email" },
    { id: "ssn", label: "Customer SSN" },
];

function UiGeneralAccessRadioExample() {
    const [value, setValue] = useState<GeneralAccessValue>("RESTRICTED");
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div className="screenshot-target" style={{ width: 560 }}>
                <UiGeneralAccessRadio
                    value={value}
                    onChange={(next) => {
                        action("value change")(next);
                        setValue(next);
                    }}
                    workspaceControls={
                        <UiGranteeRowControls
                            labels={LABELS}
                            selectedLabelIds={["id", "name", "email", "ssn"]}
                            permissionLevel="VIEW"
                            onLabelsChange={action("workspace → labels change")}
                            onPermissionChange={action("workspace → permission change")}
                        />
                    }
                />
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiGeneralAccessRadio",
};

export function Default() {
    return <UiGeneralAccessRadioExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiGeneralAccessRadioExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
