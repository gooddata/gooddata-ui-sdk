// (C) 2021-2026 GoodData Corporation

import { useState } from "react";

import { FormattedMessage, defineMessage } from "react-intl";

import { Message } from "@gooddata/sdk-ui-kit";

import { type AnalyticalDashboardUriFactory } from "../selectors/uri_selector.js";
import { type IInsightUsageOnDashboard } from "../store/insight_usage/insight_usage_state.js";

import { Spinner } from "./catalog/blocks/Spinner.js";
import { DeleteReportDialogUsageListItem } from "./DeleteReportDialogUsageListItem.js";

interface IDeleteReportDialogUsageListProps {
    isLoading: boolean;
    isEmbedded: boolean;
    referencingDashboards: IInsightUsageOnDashboard;
    analyticalDashboardUriFactory: AnalyticalDashboardUriFactory;
}

interface IReferencedDashboardsListProps {
    isEmbedded: boolean;
    referencingDashboards: IInsightUsageOnDashboard;
    analyticalDashboardUriFactory: AnalyticalDashboardUriFactory;
}

function ReferencedDashboardsList({
    referencingDashboards,
    isEmbedded,
    analyticalDashboardUriFactory,
}: IReferencedDashboardsListProps) {
    const { accessibleDashboards } = referencingDashboards;
    return (
        <ul className="gd-delete-report-dialog-usage-list">
            {accessibleDashboards.map(({ id, title }) => (
                <DeleteReportDialogUsageListItem
                    key={id}
                    id={id}
                    title={title}
                    isEmbedded={isEmbedded}
                    analyticalDashboardUriFactory={analyticalDashboardUriFactory}
                />
            ))}
        </ul>
    );
}

function InaccessibleDashboardsMessage({ count }: { count: number }) {
    return (
        <div className="gd-delete-report-dialog-usage-inaccessible s-delete-report-dialog-usage-inaccessible">
            <FormattedMessage
                id="dialogs.deleteReportConfirmation.usage.inaccessibleDashboards"
                values={{ count, b: (chunks) => <b>{chunks}</b> }}
            />
        </div>
    );
}

function OnlyInaccessibleDashboardsMessage({ count }: { count: number }) {
    return (
        <div className="gd-delete-report-dialog-usage-inaccessible s-delete-report-dialog-usage-inaccessible">
            <FormattedMessage
                id="dialogs.deleteReportConfirmation.usage.inaccessibleDashboardsOnly"
                values={{ count }}
            />
        </div>
    );
}

function ReferencedDashboards({
    referencingDashboards,
    isEmbedded,
    analyticalDashboardUriFactory,
}: IReferencedDashboardsListProps) {
    const { allDashboardsCount, accessibleDashboards, inaccessibleDashboardsCount } = referencingDashboards;

    const [showUsageList, setShowUsageList] = useState(false);

    const linkTextIntlKey = showUsageList
        ? defineMessage({ id: "dialogs.deleteReportConfirmation.usage.showLess" }).id
        : defineMessage({ id: "dialogs.deleteReportConfirmation.usage.showMore" }).id;

    const renderListOfAccessible = accessibleDashboards.length > 0;
    const renderInaccessibleOnly = accessibleDashboards.length === 0 && inaccessibleDashboardsCount > 0;
    const renderAlsoInaccessible = accessibleDashboards.length > 0 && inaccessibleDashboardsCount > 0;

    return (
        <Message type="warning">
            <div className="gd-delete-report-dialog-usage-list-header">
                <FormattedMessage
                    id="dialogs.deleteReportConfirmation.usage"
                    values={{
                        dashboardsCount: allDashboardsCount,
                        strong: (chunks) => <strong>{chunks}</strong>,
                    }}
                />
                <span
                    className="gd-delete-report-dialog-usage-more s-delete-report-dialog-usage-more"
                    onClick={() => setShowUsageList(!showUsageList)}
                >
                    <FormattedMessage id={linkTextIntlKey} />
                </span>
            </div>
            {showUsageList ? (
                <div className="gd-delete-report-dialog-usage-list-wrapper">
                    {renderListOfAccessible ? (
                        <ReferencedDashboardsList
                            isEmbedded={isEmbedded}
                            referencingDashboards={referencingDashboards}
                            analyticalDashboardUriFactory={analyticalDashboardUriFactory}
                        />
                    ) : null}
                    {renderAlsoInaccessible ? (
                        <InaccessibleDashboardsMessage count={inaccessibleDashboardsCount} />
                    ) : null}
                    {renderInaccessibleOnly ? (
                        <OnlyInaccessibleDashboardsMessage count={inaccessibleDashboardsCount} />
                    ) : null}
                </div>
            ) : null}
        </Message>
    );
}

export function DeleteReportDialogUsageList({
    isLoading,
    isEmbedded,
    referencingDashboards,
    analyticalDashboardUriFactory,
}: IDeleteReportDialogUsageListProps) {
    if (isLoading) {
        return (
            <div className="gd-delete-report-dialog-usage-loading s-delete-report-dialog-usage-loading">
                <Spinner />
                <span className="gd-delete-report-dialog-usage-loading-message">
                    <FormattedMessage id="dialogs.deleteReportConfirmation.usage.checking" />
                </span>
            </div>
        );
    }

    const isReferencedOnSomeDashboard = referencingDashboards.allDashboardsCount > 0;

    return (
        <div className="gd-delete-report-dialog-usage s-delete-report-dialog-usage">
            {isReferencedOnSomeDashboard ? (
                <ReferencedDashboards
                    isEmbedded={isEmbedded}
                    referencingDashboards={referencingDashboards}
                    analyticalDashboardUriFactory={analyticalDashboardUriFactory}
                />
            ) : (
                <Message type="progress">
                    <div className="gd-delete-report-dialog-no-usage">
                        <FormattedMessage id="dialogs.deleteReportConfirmation.usage.notUsed" />
                    </div>
                </Message>
            )}
        </div>
    );
}
