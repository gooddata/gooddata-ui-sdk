// (C) 2021-2026 GoodData Corporation

interface IDeleteReportDialogUsageListItemProps {
    title: string;
    href?: string;
}

export function DeleteReportDialogUsageListItem({ title, href }: IDeleteReportDialogUsageListItemProps) {
    if (!href) {
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
    return (
        <li>
            <a
                className="gd-delete-report-dialog-usage-list-item s-delete-report-dialog-usage-list-item"
                href={href}
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
