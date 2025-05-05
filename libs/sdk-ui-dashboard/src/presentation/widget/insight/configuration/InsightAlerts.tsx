// (C) 2022-2025 GoodData Corporation
import React from "react";
import { IInsightMenuSubmenuComponentProps } from "../../insightMenu/types.js";
import { useEnableAlertingAutomationFilterContext } from "../../../../model/index.js";
import { InsightAlertsOld } from "./InsightAlertsOld.js";
import { InsightAlertsNew } from "./InsightAlertsNew.js";

export const InsightAlerts: React.FC<IInsightMenuSubmenuComponentProps> = ({ widget, onClose, onGoBack }) => {
    const enableAutomationFilterContext = useEnableAlertingAutomationFilterContext();

    if (enableAutomationFilterContext) {
        return <InsightAlertsNew widget={widget} onClose={onClose} onGoBack={onGoBack} />;
    }

    return <InsightAlertsOld widget={widget} onClose={onClose} onGoBack={onGoBack} />;
};
