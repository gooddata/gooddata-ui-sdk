// (C) 2026 GoodData Corporation

import { useState } from "react";

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import {
    type GeneralAccessValue,
    type IUiLabelsChecklistItem,
    type IUiObjectShareDialogGrantee,
    UiGranteeRowControls,
    UiObjectShareDialog,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const LABELS: IUiLabelsChecklistItem[] = [
    { id: "id", label: "Customer ID", kind: "primary", locked: true },
    { id: "name", label: "Customer Name", kind: "default" },
    { id: "email", label: "Customer Email" },
    { id: "ssn", label: "Customer SSN" },
];

function buildGrantees(): IUiObjectShareDialogGrantee[] {
    return [
        {
            id: "owner",
            kind: "user",
            name: "Marek Stránský",
            email: "marek.stransky@gooddata.com",
            isOwner: true,
        },
        {
            id: "group",
            kind: "group",
            name: "User group",
            controls: (
                <UiGranteeRowControls
                    labels={LABELS}
                    selectedLabelIds={["id", "name", "email", "ssn"]}
                    permissionLevel="SHARE"
                    onLabelsChange={action("Group → labels change")}
                    onPermissionChange={action("Group → permission change")}
                    onRemoveAccess={action("Group → remove")}
                />
            ),
        },
        {
            id: "jane",
            kind: "user",
            name: "Jane Good",
            email: "jane.good@company.com",
            controls: (
                <UiGranteeRowControls
                    labels={LABELS}
                    selectedLabelIds={["id", "name", "email", "ssn"]}
                    permissionLevel="VIEW"
                    onLabelsChange={action("Jane → labels change")}
                    onPermissionChange={action("Jane → permission change")}
                    onRemoveAccess={action("Jane → remove")}
                />
            ),
        },
    ];
}

function UiObjectShareDialogExample() {
    const [generalAccess, setGeneralAccess] = useState<GeneralAccessValue>("RESTRICTED");
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {/* Visible placeholder so the screenshot capture has a target in
                the page DOM — the modal itself renders through `FloatingPortal`. */}
            <div className="screenshot-target" style={{ minHeight: 400 }}>
                <UiObjectShareDialog
                    isOpen
                    objectTitle="Customer"
                    onClose={action("close")}
                    grantees={buildGrantees()}
                    onAddClick={action("add")}
                    generalAccess={generalAccess}
                    onGeneralAccessChange={(value) => {
                        action("general access change")(value);
                        setGeneralAccess(value);
                    }}
                    workspaceControls={
                        <UiGranteeRowControls
                            labels={LABELS}
                            selectedLabelIds={["id", "name", "email", "ssn"]}
                            permissionLevel="VIEW"
                            onLabelsChange={action("Workspace → labels change")}
                            onPermissionChange={action("Workspace → permission change")}
                        />
                    }
                />
            </div>
        </IntlProvider>
    );
}

export default {
    title: "15 Ui/UiObjectShareDialog",
};

export function Default() {
    return <UiObjectShareDialogExample />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<UiObjectShareDialogExample />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
