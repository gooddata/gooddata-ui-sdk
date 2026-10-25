// (C) 2021-2026 GoodData Corporation

import { type AnalyticalDashboardUriFactory } from "../selectors/uri_selector.js";

interface IDeleteReportDialogUsageListItemProps {
    id: string;
    title: string;
    isEmbedded: boolean;
    analyticalDashboardUriFactory: AnalyticalDashboardUriFactory;
}

export function DeleteReportDialogUsageListItem({
    id,
    title,
    isEmbedded,
    analyticalDashboardUriFactory,
}: IDeleteReportDialogUsageListItemProps) {
    if (isEmbedded) {
        return (
            <li>
                <div className="gd-delete-report-dialog-usage-list-item s-delete-report-dialog-usage-list-item">
                    <span className="gd-delete-report-dialog-usage-list-item-text" title={title}>
                        {title}
                    </span>
                </div>
            </li>
        );
    }
    const dashboardUri = analyticalDashboardUriFactory(id);
    return (
        <li>
            <a
                className="gd-delete-report-dialog-usage-list-item s-delete-report-dialog-usage-list-item"
                href={dashboardUri}
                rel="noopener noreferrer"
                target="_blank"
            >
                <span className="gd-delete-report-dialog-usage-list-item-link" title={title}>
                    {title}
                </span>
                <span className="gd-delete-report-dialog-usage-list-item-icon" />
            </a>
        </li>
    );
}
