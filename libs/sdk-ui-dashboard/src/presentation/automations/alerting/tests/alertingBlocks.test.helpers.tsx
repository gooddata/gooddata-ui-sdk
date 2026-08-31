// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import {
    AlertingDialogContextProvider,
    type IAlertingDialogContextValue,
} from "../../contexts/AlertingDialogContext.js";
import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../contexts/AutomationsContext.js";
import { AlertingDialogStateProvider } from "../state/AlertingDialogStateProvider.js";

import { ALERTING_DIALOG_CONTEXT, AUTOMATIONS_CONTEXT } from "./alerting.test.helpers.js";

// The `useValidateExistingAutomationFilters` return of a dialog whose saved filters are all fine.
// Spread-override the members a staleness test cares about.
export const VALID_FILTERS_RESULT = {
    isValid: true,
    hiddenFilterIsMissingInSavedFilters: false,
    hiddenFilterHasDifferentValueInSavedFilter: false,
    lockedFilterIsMissingInSavedFilters: false,
    lockedFilterHasDifferentValueInSavedFilter: false,
    ignoredFilterIsAppliedInSavedFilters: false,
    removedFilterIsAppliedInSavedFilters: false,
    commonDateFilterIsMissingInSavedVisibleFilters: false,
    visibleFilterIsMissingInSavedFilters: false,
    visibleFiltersAreMissing: false,
    incompatibleSelectionTypeIsAppliedInSavedFilters: false,
    filtersAreStale: false,
};

// The provider stack an alerting block needs: backend and workspace for the executions, intl for
// the labels, the two dialog contexts, and the state providers the block accessors read.
export function BlockProviders({
    children,
    dialogContext = ALERTING_DIALOG_CONTEXT,
    automationsContext = AUTOMATIONS_CONTEXT,
}: {
    children: ReactNode;
    dialogContext?: IAlertingDialogContextValue;
    automationsContext?: IAutomationsContextValue;
}) {
    return (
        <BackendProvider backend={dummyBackend()}>
            <WorkspaceProvider workspace="ws-1">
                <IntlWrapper>
                    <AutomationsContextProvider value={automationsContext}>
                        <AlertingDialogContextProvider value={dialogContext}>
                            <AlertingDialogStateProvider>{children}</AlertingDialogStateProvider>
                        </AlertingDialogContextProvider>
                    </AutomationsContextProvider>
                </IntlWrapper>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
