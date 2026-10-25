// (C) 2020-2026 GoodData Corporation

import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { getSourceDashboardId, isAllowedDashboardLinks } from "../../selectors/route_selector.js";
import { analyticalDashboardUriFactorySelector } from "../../selectors/uri_selector.js";
import { type IInsightUsageOnDashboardItem } from "../../store/insight_usage/insight_usage_state.js";

export interface IDashboardItemProps {
    dashboard: IInsightUsageOnDashboardItem;
}

export function DashboardItem({ dashboard }: IDashboardItemProps) {
    const intl = useIntl();
    const isAllowLinkToDashboard = useSelector(isAllowedDashboardLinks);
    const sourceDashboardId = useSelector(getSourceDashboardId);
    const analyticalDashboardUriFactory = useSelector(analyticalDashboardUriFactorySelector);

    const { id, title } = dashboard;
    const isLinkable = isAllowLinkToDashboard && id !== sourceDashboardId;
    const displayTitle = (
        <span>
            {id === sourceDashboardId
                ? `${title} (${intl.formatMessage({ id: "dashboard.editing.now" })})`
                : title}
        </span>
    );

    const dashboardUri = analyticalDashboardUriFactory(id);
    return (
        <li key={id} className="s-insight-usage-dashboard-item">
            {isLinkable ? (
                <a className="dashboard-item" href={dashboardUri} rel="noopener noreferrer" target="_blank">
                    {displayTitle}
                </a>
            ) : (
                displayTitle
            )}
        </li>
    );
}
