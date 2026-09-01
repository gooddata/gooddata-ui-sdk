// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../contexts/AutomationsContext.js";
import {
    type IScheduledEmailDialogContextValue,
    ScheduledEmailDialogContextProvider,
} from "../../contexts/ScheduledEmailDialogContext.js";
import { ScheduledEmailDialogStateProvider } from "../state/ScheduledEmailDialogStateProvider.js";

import { AUTOMATIONS_CONTEXT, SCHEDULED_EMAIL_DIALOG_CONTEXT } from "./scheduledEmail.test.helpers.js";

// The provider stack a scheduled-email block needs: backend and workspace for the executions, intl
// for the labels, the two dialog contexts, and the state providers the block accessors read.
export function BlockProviders({
    children,
    dialogContext = SCHEDULED_EMAIL_DIALOG_CONTEXT,
    automationsContext = AUTOMATIONS_CONTEXT,
}: {
    children: ReactNode;
    dialogContext?: IScheduledEmailDialogContextValue;
    automationsContext?: IAutomationsContextValue;
}) {
    return (
        <BackendProvider backend={dummyBackend()}>
            <WorkspaceProvider workspace="ws-1">
                <IntlWrapper>
                    <AutomationsContextProvider value={automationsContext}>
                        <ScheduledEmailDialogContextProvider value={dialogContext}>
                            <ScheduledEmailDialogStateProvider>{children}</ScheduledEmailDialogStateProvider>
                        </ScheduledEmailDialogContextProvider>
                    </AutomationsContextProvider>
                </IntlWrapper>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
