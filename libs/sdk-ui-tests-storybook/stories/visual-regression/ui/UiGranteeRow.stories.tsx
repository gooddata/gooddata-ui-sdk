// (C) 2026 GoodData Corporation

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import {
    type IUiLabelsChecklistItem,
    UiGranteeRow,
    UiGranteeRowControls,
    UiIcon,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const LABELS: IUiLabelsChecklistItem[] = [
    { id: "id", label: "Customer ID", kind: "primary", locked: true },
    { id: "name", label: "Customer Name", kind: "default" },
    { id: "email", label: "Customer Email" },
    { id: "ssn", label: "Customer SSN" },
];

function makeControls(rowName: string, permissionLevel: "VIEW" | "SHARE") {
    return (
        <UiGranteeRowControls
            labels={LABELS}
            selectedLabelIds={["id", "name", "email", "ssn"]}
            permissionLevel={permissionLevel}
            onLabelsChange={action(`${rowName} → labels change`)}
            onPermissionChange={action(`${rowName} → permission change`)}
            onRemoveAccess={action(`${rowName} → remove`)}
        />
    );
}

// Demonstrates the "this grantee has a constrained / risky permission state"
// indicator shown in the OLP spec next to the row's controls — e.g. when label
// access was reduced or some other condition needs the author's attention. The
// row's controls slot accepts any ReactNode, so this is pure composition: the
// kit doesn't need a dedicated prop for it.
function makeWarnedControls(rowName: string, permissionLevel: "VIEW" | "SHARE") {
    return (
        <>
            <UiIcon type="warning" size={14} color="warning" accessibilityConfig={{ ariaLabel: "Warning" }} />
            {makeControls(rowName, permissionLevel)}
        </>
    );
}

function UiGranteeRowExample() {
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div className="screenshot-target" style={{ width: 560 }}>
                <UiGranteeRow kind="user" name="Marek Stránský" email="marek.stransky@gooddata.com" isOwner />
                <UiGranteeRow kind="group" name="Admin" controls={makeControls("Admin", "VIEW")} />
                <UiGranteeRow
                    kind="user"
                    name="Jana Dvořák"
                    email="jana.dvorak@gooddata.com"
                    controls={makeControls("Jana", "SHARE")}
                />
                <UiGranteeRow
                    kind="user"
                    name="Karel Novák"
                    email="karel.novak@partner.com"
                    controls={makeWarnedControls("Karel", "VIEW")}
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
