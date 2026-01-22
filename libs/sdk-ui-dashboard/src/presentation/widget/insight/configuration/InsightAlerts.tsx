// (C) 2022-2026 GoodData Corporation

import { InsightAlertsNew } from "./InsightAlertsNew.js";
import { InsightAlertsOld } from "./InsightAlertsOld.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectEnableAutomationFilterContext } from "../../../../model/store/config/configSelectors.js";
import { type IInsightMenuSubmenuComponentProps } from "../../insightMenu/types.js";

export function InsightAlerts({ widget, onClose, onGoBack }: IInsightMenuSubmenuComponentProps) {
    const enableAutomationFilters = useDashboardSelector(selectEnableAutomationFilterContext);

    if (enableAutomationFilters) {
        return <InsightAlertsNew widget={widget} onClose={onClose} onGoBack={onGoBack} />;
    }

    return <InsightAlertsOld widget={widget} onClose={onClose} onGoBack={onGoBack} />;
}
