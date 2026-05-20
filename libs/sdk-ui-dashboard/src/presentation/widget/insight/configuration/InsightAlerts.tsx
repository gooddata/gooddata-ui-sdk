// (C) 2022-2026 GoodData Corporation

import { type IInsightMenuSubmenuComponentProps } from "../../insightMenu/types.js";

import { InsightAlertsNew } from "./InsightAlertsNew.js";

export function InsightAlerts({ widget, onClose, onGoBack }: IInsightMenuSubmenuComponentProps) {
    return <InsightAlertsNew widget={widget} onClose={onClose} onGoBack={onGoBack} />;
}
