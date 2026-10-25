// (C) 2020-2026 GoodData Corporation

import { FormattedMessage, useIntl } from "react-intl";

import {
    type IInsightUsageOnDashboard,
    type IInsightUsageOnDashboardItem,
} from "../../store/insight_usage/insight_usage_state.js";

import { DashboardItem } from "./DashboardItem.js";

function InaccessibleDashboardsMessage({ count }: { count: number }) {
    return (
        <div className="gd-kd-save-report-dialog-usage-inaccessible s-kd-save-dialog-usage-inaccessible">
            <FormattedMessage
                id="dialogs.deleteReportConfirmation.usage.inaccessibleDashboards"
                values={{ count, b: (chunks) => <b>{chunks}</b> }}
            />
        </div>
    );
}

function OnlyInaccessibleDashboardsMessage({ count }: { count: number }) {
    return (
        <div className="gd-kd-save-report-dialog-usage-inaccessible s-kd-save-dialog-usage-inaccessible">
            <FormattedMessage
                id="dialogs.deleteReportConfirmation.usage.inaccessibleDashboardsOnly"
                values={{ count }}
            />
        </div>
    );
}

export type InsightUsageOnDashboardsProps = {
    insightUsedOnDashboards: IInsightUsageOnDashboard;
};

export function Component({ insightUsedOnDashboards }: InsightUsageOnDashboardsProps) {
    const intl = useIntl();

    const { accessibleDashboards, inaccessibleDashboardsCount, allDashboardsCount } = insightUsedOnDashboards;

    const renderListOfAccessible = accessibleDashboards.length > 0;
    const renderInaccessibleOnly = accessibleDashboards.length === 0 && inaccessibleDashboardsCount > 0;
    const renderAlsoInaccessible = accessibleDashboards.length > 0 && inaccessibleDashboardsCount > 0;

    return (
        <div className="view-usage-wrapper s-view-usage">
            <details className="gd-collapsible-section">
                <summary>
                    {intl.formatMessage(
                        { id: "dialogs.saveReportFromKD.viewUsageDashboard" },
                        { dashboardCount: allDashboardsCount },
                    )}
                </summary>
                <div className="gd-collapsible-content gd-state-text">
                    {renderListOfAccessible ? (
                        <ul>
                            {accessibleDashboards.map((dash: IInsightUsageOnDashboardItem) => (
                                <DashboardItem key={dash.id} dashboard={dash} />
                            ))}
                        </ul>
                    ) : null}
                    {renderAlsoInaccessible ? (
                        <InaccessibleDashboardsMessage count={inaccessibleDashboardsCount} />
                    ) : null}
                    {renderInaccessibleOnly ? (
                        <OnlyInaccessibleDashboardsMessage count={inaccessibleDashboardsCount} />
                    ) : null}
                </div>
            </details>
        </div>
    );
}

export const InsightUsageOnDashboardsList = Component;
