// (C) 2022-2025 GoodData Corporation
import React from "react";

import { InsightAlertsNew } from "./InsightAlertsNew.js";
import { InsightAlertsOld } from "./InsightAlertsOld.js";
import { selectEnableAutomationFilterContext, useDashboardSelector } from "../../../../model/index.js";
import { IInsightMenuSubmenuComponentProps } from "../../insightMenu/types.js";

export const InsightAlerts: React.FC<IInsightMenuSubmenuComponentProps> = ({ widget, onClose, onGoBack }) => {
    const enableAutomationFilters = useDashboardSelector(selectEnableAutomationFilterContext);

    if (enableAutomationFilters) {
        return <InsightAlertsNew widget={widget} onClose={onClose} onGoBack={onGoBack} />;
    }

    return <InsightAlertsOld widget={widget} onClose={onClose} onGoBack={onGoBack} />;
};
