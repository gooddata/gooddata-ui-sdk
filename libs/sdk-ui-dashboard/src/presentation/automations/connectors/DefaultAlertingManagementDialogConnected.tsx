// (C) 2026 GoodData Corporation

import { DefaultAlertingManagementDialogNew as DefaultAlertingManagementDialogNewInner } from "../alerting/DefaultAlertingManagementDialog/DefaultAlertingManagementDialogNew.js";
import { type IAlertingManagementDialogProps } from "../alerting/types.js";
import { AlertingManagementDialogContextProvider } from "../contexts/AlertingManagementDialogContext.js";
import { AutomationsContextProvider } from "../contexts/AutomationsContext.js";

import { useBuildAlertingManagementDialogContext } from "./hooks/useBuildAlertingManagementDialogContext.js";
import { useBuildAutomationsContext } from "./hooks/useBuildAutomationsContext.js";

/**
 * Self-contained version of DefaultAlertingManagementDialogNew that builds the required
 * AutomationsContext and AlertingManagementDialogContext internally from the dashboard
 * Redux store. Use this export when mounting the management dialog outside of
 * AlertingConnector (e.g. embedding scenarios, storybooks, or custom dashboard shells).
 *
 * @alpha
 */
export function DefaultAlertingManagementDialogNew(props: IAlertingManagementDialogProps) {
    const automationsCtx = useBuildAutomationsContext();
    const managementCtx = useBuildAlertingManagementDialogContext();

    return (
        <AutomationsContextProvider value={automationsCtx}>
            <AlertingManagementDialogContextProvider value={managementCtx}>
                <DefaultAlertingManagementDialogNewInner {...props} />
            </AlertingManagementDialogContextProvider>
        </AutomationsContextProvider>
    );
}
