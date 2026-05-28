// (C) 2026 GoodData Corporation

import { useState } from "react";

import { IntlProvider } from "react-intl";
import { action } from "storybook/actions";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import {
    type GeneralAccessValue,
    type IUiObjectShareDialogGrantee,
    UiObjectShareDialog,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function controls(label: string) {
    return <span style={{ color: "var(--gd-palette-complementary-6)" }}>{label}</span>;
}

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
            controls: controls("Can share"),
        },
        {
            id: "jane",
            kind: "user",
            name: "Jane Good",
            email: "jane.good@company.com",
            controls: controls("Can view"),
        },
    ];
}

function UiObjectShareDialogExample() {
    const [generalAccess, setGeneralAccess] = useState<GeneralAccessValue>("RESTRICTED");
    return (
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            <div className="screenshot-target" style={{ padding: 24, background: "rgba(20,56,93,0.08)" }}>
                <UiObjectShareDialog
                    objectTitle="Customer"
                    onClose={action("close")}
                    grantees={buildGrantees()}
                    onAddClick={action("add")}
                    generalAccess={generalAccess}
                    onGeneralAccessChange={(value) => {
                        action("general access change")(value);
                        setGeneralAccess(value);
                    }}
                    workspaceControls={controls("Can view")}
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
