// (C) 2020-2026 GoodData Corporation

import { FormattedMessage, type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import {
    type IInsightUsageInDocuments,
    type IInsightUsageOnDashboard,
    type IInsightUsageOnDashboardItem,
} from "../../store/insight_usage/insight_usage_state.js";

import { DashboardItem } from "./DashboardItem.js";
import { DocumentItem } from "./DocumentItem.js";

const inaccessibleMessages = defineMessages({
    dashboards: { id: "dialogs.deleteReportConfirmation.usage.inaccessibleDashboards" },
    dashboardsOnly: { id: "dialogs.deleteReportConfirmation.usage.inaccessibleDashboardsOnly" },
    documents: { id: "dialogs.deleteReportConfirmation.usage.inaccessibleDocuments" },
    documentsOnly: { id: "dialogs.deleteReportConfirmation.usage.inaccessibleDocumentsOnly" },
});

interface IInaccessibleMessageProps {
    message: MessageDescriptor;
    count: number;
}

function InaccessibleMessage({ message, count }: IInaccessibleMessageProps) {
    return (
        <div className="gd-kd-save-report-dialog-usage-inaccessible s-kd-save-dialog-usage-inaccessible">
            <FormattedMessage {...message} values={{ count, b: (chunks) => <b>{chunks}</b> }} />
        </div>
    );
}

function OnlyInaccessibleMessage({ message, count }: IInaccessibleMessageProps) {
    return (
        <div className="gd-kd-save-report-dialog-usage-inaccessible s-kd-save-dialog-usage-inaccessible">
            <FormattedMessage {...message} values={{ count }} />
        </div>
    );
}

export type InsightUsageOnDashboardsProps = {
    insightUsedOnDashboards: IInsightUsageOnDashboard;
    insightUsedInDocuments: IInsightUsageInDocuments;
};

export function Component({
    insightUsedOnDashboards,
    insightUsedInDocuments,
}: InsightUsageOnDashboardsProps) {
    const intl = useIntl();

    const { accessibleDashboards, inaccessibleDashboardsCount, allDashboardsCount } = insightUsedOnDashboards;
    const { accessibleDocuments, inaccessibleDocumentsCount, allDocumentsCount } = insightUsedInDocuments;

    const renderListOfAccessible = accessibleDashboards.length > 0;
    const renderInaccessibleOnly = accessibleDashboards.length === 0 && inaccessibleDashboardsCount > 0;
    const renderAlsoInaccessible = accessibleDashboards.length > 0 && inaccessibleDashboardsCount > 0;

    return (
        <div className="view-usage-wrapper s-view-usage">
            {allDashboardsCount > 0 ? (
                <details className="gd-collapsible-section s-view-usage-dashboards">
                    <summary>
                        {intl.formatMessage(
                            { id: "dialogs.saveReportFromKD.usage.dashboards" },
                            { count: allDashboardsCount },
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
                            <InaccessibleMessage
                                message={inaccessibleMessages.dashboards}
                                count={inaccessibleDashboardsCount}
                            />
                        ) : null}
                        {renderInaccessibleOnly ? (
                            <OnlyInaccessibleMessage
                                message={inaccessibleMessages.dashboardsOnly}
                                count={inaccessibleDashboardsCount}
                            />
                        ) : null}
                    </div>
                </details>
            ) : null}
            {allDocumentsCount > 0 ? (
                <details className="gd-collapsible-section s-view-usage-documents">
                    <summary>
                        {intl.formatMessage(
                            { id: "dialogs.saveReportFromKD.usage.documents" },
                            { count: allDocumentsCount },
                        )}
                    </summary>
                    <div className="gd-collapsible-content gd-state-text">
                        {accessibleDocuments.length > 0 ? (
                            <ul>
                                {accessibleDocuments.map((item) => (
                                    <DocumentItem key={`${item.type}/${item.id}`} item={item} />
                                ))}
                            </ul>
                        ) : null}
                        {accessibleDocuments.length > 0 && inaccessibleDocumentsCount > 0 ? (
                            <InaccessibleMessage
                                message={inaccessibleMessages.documents}
                                count={inaccessibleDocumentsCount}
                            />
                        ) : null}
                        {accessibleDocuments.length === 0 ? (
                            <OnlyInaccessibleMessage
                                message={inaccessibleMessages.documentsOnly}
                                count={inaccessibleDocumentsCount}
                            />
                        ) : null}
                    </div>
                </details>
            ) : null}
        </div>
    );
}

export const InsightUsageOnDashboardsList = Component;
