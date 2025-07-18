// (C) 2022-2025 GoodData Corporation
import { IInsightMenuSubmenuComponentProps } from "../../insightMenu/types.js";
import { selectEnableAutomationFilterContext, useDashboardSelector } from "../../../../model/index.js";
import { InsightAlertsOld } from "./InsightAlertsOld.js";
import { InsightAlertsNew } from "./InsightAlertsNew.js";

export function InsightAlerts({ widget, onClose, onGoBack }: IInsightMenuSubmenuComponentProps) {
    const enableAutomationFilters = useDashboardSelector(selectEnableAutomationFilterContext);

    if (enableAutomationFilters) {
        return <InsightAlertsNew widget={widget} onClose={onClose} onGoBack={onGoBack} />;
    }

    return <InsightAlertsOld widget={widget} onClose={onClose} onGoBack={onGoBack} />;
}
