// (C) 2022-2026 GoodData Corporation

import { useBuildAlertingManagementDialogContext } from "../../../automations/connectors/hooks/useBuildAlertingManagementDialogContext.js";
import { useBuildAutomationsContext } from "../../../automations/connectors/hooks/useBuildAutomationsContext.js";
import { AlertingManagementDialogContextProvider } from "../../../automations/contexts/AlertingManagementDialogContext.js";
import { AutomationsContextProvider } from "../../../automations/contexts/AutomationsContext.js";
import { type IInsightMenuSubmenuComponentProps } from "../../insightMenu/types.js";

import { InsightAlertsNew } from "./InsightAlertsNew.js";

export function InsightAlerts({ widget, onClose, onGoBack }: IInsightMenuSubmenuComponentProps) {
    const automationsCtx = useBuildAutomationsContext();
    const managementCtx = useBuildAlertingManagementDialogContext();

    return (
        <AutomationsContextProvider value={automationsCtx}>
            <AlertingManagementDialogContextProvider value={managementCtx}>
                <InsightAlertsNew widget={widget} onClose={onClose} onGoBack={onGoBack} />
            </AlertingManagementDialogContextProvider>
        </AutomationsContextProvider>
    );
}
